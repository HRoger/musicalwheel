# Prompt: Create Post Block - Phase B Field Rendering

**Date:** November 23, 2025
**Session Type:** Implementation
**Phase:** Phase B - Field Rendering (30+ Field Types)
**Prerequisites:** Phase A 95% Complete ✅

---

## ⚠️ MANDATORY READING - READ THESE FIRST

Before starting ANY work, you MUST read these documents in order:

### 1. **CRITICAL - Technical Summary** ⭐ MOST IMPORTANT
**File:** `docs/conversions/create-post-technical-summary.md`

**Why Critical:**
- Explains how Gutenberg Editor Form Rendering works
- Documents ServerSideRender architecture
- Shows exact Voxel API usage patterns
- Explains import maps system
- **This is the foundation for understanding the block architecture**

**Key Sections to Focus On:**
- Section 2: "Gutenberg Editor Form Rendering" (lines 161-525)
- Section 2.3: "Implementation Details" - Shows exact code patterns
- Section 2.5: "Auto-Discovery System" - How blocks are registered
- Section 3.2: "1:1 Voxel Matching Strategy" - Critical methodology

### 2. **Phase A Status Report**
**File:** `docs/conversions/create-post-phase-a-95%-complete.md`

**Why Important:**
- Current status: 95% complete
- What's working vs what's not
- Hybrid build system (editor: production, frontend: watch mode)
- Outstanding issue: Editor preview not rendering (cosmetic only)

**Key Sections:**
- Section 1: "Hybrid Build System" - Current architecture
- Section 2: "React Component Architecture" - What's implemented
- Section 4: "Data Flow" - How data flows from PHP to React
- Section 5: "Frontend Form Fully Functional" - What works
- Section "Issue 1: Editor Preview Not Rendering" - Known limitation

### 3. **Build System Fixes**
**File:** `docs/project-log/tasks/task-create-post-phase-a-build-fixes-nov-23-2025.md`

**Why Important:**
- Documents the hybrid build system solution
- Explains why dev mode was disabled for editor blocks
- Shows watch mode approach for frontend
- Lists all files modified and why

**Key Sections:**
- Section "Hybrid Build System" - Final solution
- Section "Development Workflow" - How to use `npm run dev`
- Section "Key Learnings" - Why this approach works

### 4. **Architecture Update**
**File:** `docs/conversions/create-post-architecture-update.md`

**Why Important:**
- Documents dual build system (ES modules + IIFE)
- Shows why React on frontend (not Vue)
- Explains CSS architecture
- Current issues and solutions

**Key Sections:**
- Section "React on BOTH Editor AND Frontend" - Architecture decision
- Section "Build Configuration" - Dual build system details
- Section "CSS Architecture" - Voxel CSS integration

### 5. **Analysis Document**
**File:** `docs/conversions/create-post-analysis.md`

**Why Important:**
- Complete field type inventory (30 types)
- Voxel dependencies and APIs
- Conversion strategy
- Risk assessment

**Key Sections:**
- Section 2.2: "Field Types Supported (30 types)" - What needs to be built
- Section 2.4: "Vue.js Architecture" - Voxel's data structure (for reference)
- Section 6: "Conversion Strategy" - Implementation phases
- Section 9: "Dependencies & API Analysis" - Voxel APIs to use

---

## 🎯 Session Goals

### Primary Goal: Implement Field Rendering System

**Phase B Objective:**
Implement React components for all 30+ Voxel field types, matching Voxel's HTML structure and CSS classes exactly.

**Success Criteria:**
- All field types render correctly on frontend
- HTML structure matches Voxel templates exactly
- CSS classes match Voxel (using `ts-*` prefixes)
- Field validation works
- Conditional logic works (field visibility rules)

---

## 📋 Current Status (Phase A Complete)

### ✅ What's Working:

1. **Hybrid Build System** ✅
   - Editor blocks: Production builds (no `rungen` errors)
   - Frontend: Watch mode (`npm run dev` for fast iteration)
   - Import maps handle `@wordpress/*` packages

2. **Frontend Form** ✅
   - React component mounts correctly
   - Form submission works end-to-end
   - Voxel styling applied
   - Success/error screens working
   - Draft saving functional

3. **Basic Field Types** ✅
   - Text, email, url, textarea, number fields render
   - Form state management works
   - Client-side validation implemented

4. **Data Flow** ✅
   - PHP → React via `wp_localize_script`
   - Voxel field config flows correctly
   - Post type selection works

### ⚠️ Known Issues:

1. **Editor Preview** (Cosmetic Only)
   - ServerSideRender shows "Loading form..." placeholder
   - Block renderer endpoint not registered
   - **Impact:** LOW - Frontend works perfectly
   - **Priority:** Can be fixed later or proceed to Phase B

---

## 🚀 Phase B Implementation Plan

### Step 1: Field Component Architecture

**Create Base Field Component:**
```
app/blocks/src/create-post/components/
├── FieldBase.tsx          # Abstract base component
├── fields/
│   ├── TextField.tsx      # Text input
│   ├── EmailField.tsx     # Email input
│   ├── NumberField.tsx    # Number input
│   ├── TextareaField.tsx  # Textarea
│   ├── SelectField.tsx    # Dropdown
│   ├── FileField.tsx      # File upload
│   ├── LocationField.tsx  # Map picker
│   └── ... (30+ field types)
```

**FieldBase Pattern:**
```typescript
interface FieldBaseProps {
  field: VoxelField;
  value: any;
  onChange: (value: any) => void;
  errors: string[];
}

export abstract class FieldBase extends React.Component<FieldBaseProps> {
  // Shared logic: validation, error display, label rendering
  // Each field type extends this
}
```

### Step 2: Field Type Implementation Order

**Priority 1 (Basic - Already Working):**
- ✅ Text
- ✅ Email
- ✅ URL
- ✅ Number
- ✅ Textarea
- ✅ Description

**Priority 2 (Selection Fields):**
- Select (dropdown)
- Multi-select
- Radio buttons
- Checkboxes
- Switcher (toggle)

**Priority 3 (Date/Time):**
- Date picker
- Time picker
- Timezone selector
- Recurring dates
- Work hours

**Priority 4 (File/Media):**
- File upload
- Image upload
- Profile avatar

**Priority 5 (Complex):**
- Location (map picker) - **HIGH PRIORITY** (replaces random coords)
- Repeater fields
- Product fields
- Post relation
- Taxonomy fields

**Priority 6 (UI Fields):**
- UI heading
- UI HTML
- UI image

### Step 3: 1:1 Voxel Matching Requirements

**CRITICAL:** Every field component MUST match Voxel's HTML structure exactly.

**Discovery Process (MANDATORY):**
1. Find Voxel template: `themes/voxel/templates/widgets/create-post/{type}-field.php`
2. Read the exact HTML structure
3. Note all CSS classes (especially `ts-*` prefixes)
4. Note all data attributes
5. Note JavaScript/Vue directives (convert to React)
6. Implement React component matching exactly

**Example - Text Field:**
```typescript
// Voxel template: text-field.php
// Our React component must match:
<div className="ts-form-group ts-input-field">
  <label className="ts-form-label">
    {label}
    {required && <span className="required">*</span>}
  </label>
  <input
    type="text"
    className="ts-input-text"
    name={`vx_field_${field.key}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
  {errors.length > 0 && (
    <div className="ts-form-error">{errors[0]}</div>
  )}
</div>
```

### Step 4: Field Validation

**Client-Side Validation:**
- Use Voxel's validation rules from `get_frontend_config()`
- Match validation messages from Voxel
- Show errors in Voxel's format

**Validation Types:**
- Required fields
- Min/max length (text)
- Min/max values (number)
- Pattern matching (email, url, phone)
- File size/type (file uploads)
- Custom validation rules

### Step 5: Conditional Logic

**Field Visibility Rules:**
- Implement `passes_visibility_rules()` logic in React
- Show/hide fields based on other field values
- Support all 22 condition types from Voxel

**Condition Types:**
- `text:equals`, `text:contains`
- `number:gt`, `number:lt`, `number:between`
- `switcher:checked`, `switcher:unchecked`
- `file:empty`, `file:not_empty`
- `date:gt`, `date:lt`
- `taxonomy:contains`
- And 12 more...

---

## 🔍 Discovery Requirements

### Before Implementing ANY Field Type:

**MANDATORY Discovery Checklist:**

1. **Find Voxel Template:**
   ```bash
   find themes/voxel/templates/widgets/create-post -name "*{field-type}-field.php"
   ```

2. **Read Template File:**
   - Note exact HTML structure
   - Note all CSS classes
   - Note data attributes
   - Note Vue directives (convert to React state)

3. **Find Vue Component (if exists):**
   ```bash
   grep -r "field-{type}" themes/voxel/assets/js/src/
   ```

4. **Check Field Class:**
   ```bash
   find themes/voxel/app/post-types/fields -name "*{field-type}*.php"
   ```

5. **Document Findings:**
   - HTML structure
   - CSS classes used
   - JavaScript behavior
   - Validation rules
   - Dependencies

**Example Discovery Output:**
```
Field: Text Field
Template: themes/voxel/templates/widgets/create-post/text-field.php:15-45
HTML Structure:
  <div class="ts-form-group ts-input-field">
    <label class="ts-form-label">...</label>
    <input class="ts-input-text" />
  </div>
CSS Classes: ts-form-group, ts-input-field, ts-form-label, ts-input-text
Validation: required, minlength, maxlength, pattern
```

---

## 🎨 Implementation Standards

### HTML Structure
- ✅ Match Voxel templates exactly
- ✅ Use Voxel CSS classes (`ts-*` prefixes)
- ✅ Include all data attributes
- ✅ Match DOM hierarchy

### CSS Classes
- ✅ Use Voxel's exact class names
- ✅ Don't create custom classes
- ✅ Override only when necessary (with `!important`)

### React Patterns
- ✅ Functional components with hooks
- ✅ TypeScript strict mode
- ✅ Proper error handling
- ✅ Accessibility (ARIA labels, keyboard navigation)

### Validation
- ✅ Client-side validation matching Voxel
- ✅ Error messages from Voxel config
- ✅ Visual error display matching Voxel

---

## 📁 File Structure to Create

```
app/blocks/src/create-post/
├── block.json              ✅ Exists
├── index.tsx               ✅ Exists
├── edit.tsx                ✅ Exists
├── frontend.tsx            ✅ Exists
├── types.ts                ✅ Exists
├── render.php              ✅ Exists
├── style.css               ✅ Exists
└── components/             ⚠️ TO CREATE
    ├── FieldRenderer.tsx   # Main field router
    ├── FieldBase.tsx       # Abstract base component
    ├── fields/
    │   ├── TextField.tsx
    │   ├── EmailField.tsx
    │   ├── NumberField.tsx
    │   ├── TextareaField.tsx
    │   ├── SelectField.tsx
    │   ├── FileField.tsx
    │   ├── LocationField.tsx
    │   └── ... (30+ field types)
    ├── validation/
    │   ├── Validator.ts    # Validation logic
    │   └── rules.ts        # Validation rules
    └── utils/
        ├── fieldHelpers.ts # Field utility functions
        └── conditionalLogic.ts # Visibility rules
```

---

## 🎯 First Task: Location Field (High Priority)

**Why First:**
- Currently using random coordinates (workaround)
- Database error workaround needs proper solution
- High complexity - good test case

**Discovery Steps:**
1. Read `themes/voxel/templates/widgets/create-post/location-field.php`
2. Find Vue component: `themes/voxel/assets/js/src/fields/location-field.js`
3. Check field class: `themes/voxel/app/post-types/fields/location-field.php`
4. Understand map provider integration (Google Maps vs Mapbox)
5. Document HTML structure, CSS classes, JavaScript behavior

**Implementation Requirements:**
- Map picker UI (Google Maps or Mapbox)
- Address autocomplete
- Geocoding integration
- Latitude/longitude storage
- "My Location" button
- Map marker drag functionality

**Voxel Integration:**
- Use `\Voxel\get('settings.maps.provider')` to detect provider
- Use Voxel's map abstraction layer
- Match Voxel's map UI exactly

---

## ⚠️ Critical Rules

### 1. Discovery-First Methodology
- **NEVER** guess field structure
- **ALWAYS** read Voxel template first
- **ALWAYS** provide file paths as evidence

### 2. 1:1 Voxel Matching
- Match HTML structure exactly
- Match CSS classes exactly
- Match JavaScript behavior exactly
- Match validation messages exactly

### 3. Autoloader Conflict Prevention
- Use `VoxelFSE\` namespace (not `Voxel\`)
- Use `fse-` prefix for child theme files
- Check for conflicts before creating files

### 4. Evidence-Based Claims
- Every statement must include file path + line number
- Show code snippets from Voxel
- Document findings before implementing

---

## 📚 Reference Documents Summary

### Technical Summary (MOST IMPORTANT)
- **File:** `docs/conversions/create-post-technical-summary.md`
- **Focus:** Section 2 - Gutenberg Editor Form Rendering
- **Key Info:** ServerSideRender architecture, import maps, Voxel API usage

### Phase A Status
- **File:** `docs/conversions/create-post-phase-a-95%-complete.md`
- **Focus:** Current status, what works, what doesn't
- **Key Info:** Hybrid build system, frontend functionality

### Build Fixes
- **File:** `docs/project-log/tasks/task-create-post-phase-a-build-fixes-nov-23-2025.md`
- **Focus:** Build system solution, development workflow
- **Key Info:** `npm run dev` for frontend, production for editor

### Architecture
- **File:** `docs/conversions/create-post-architecture-update.md`
- **Focus:** Dual build system, React architecture
- **Key Info:** Why React on frontend, build configuration

### Analysis
- **File:** `docs/conversions/create-post-analysis.md`
- **Focus:** Field types inventory, Voxel dependencies
- **Key Info:** 30 field types, conversion strategy

---

## 🚦 Session Start Checklist

Before writing ANY code:

- [ ] Read `docs/conversions/create-post-technical-summary.md` (Section 2)
- [ ] Read `docs/conversions/create-post-phase-a-95%-complete.md` (Status section)
- [ ] Read `docs/project-log/tasks/task-create-post-phase-a-build-fixes-nov-23-2025.md` (Build system)
- [ ] Read `docs/conversions/create-post-architecture-update.md` (Architecture)
- [ ] Read `docs/conversions/create-post-analysis.md` (Field types)
- [ ] Understand hybrid build system (editor: production, frontend: watch mode)
- [ ] Understand ServerSideRender architecture
- [ ] Understand 1:1 Voxel matching requirements
- [ ] Check current Phase A status (95% complete)

---

## 🎯 Recommended Starting Point

### Option 1: Fix Editor Preview (1 hour)
**If user wants to complete Phase A first:**
- Debug ServerSideRender REST endpoint
- Register block renderer endpoint explicitly
- Test endpoint: `/wp-json/wp/v2/block-renderer/voxel-fse/create-post`

### Option 2: Start Phase B - Location Field (Recommended)
**If user wants to proceed:**
- Implement location field UI (replaces random coordinates)
- High priority - fixes database workaround
- Good test case for complex field implementation

### Option 3: Start Phase B - Basic Field Types
**If user wants incremental approach:**
- Implement remaining basic fields (select, radio, checkbox)
- Lower complexity, builds confidence
- Establishes field component patterns

---

## 💡 Key Reminders

1. **Hybrid Build System:**
   - Editor blocks: Always production builds
   - Frontend: Use `npm run dev` (watch mode)
   - No `rungen` errors with this approach

2. **1:1 Voxel Matching:**
   - Read Voxel templates first
   - Match HTML structure exactly
   - Use Voxel CSS classes

3. **Discovery Before Implementation:**
   - Never guess field structure
   - Always provide file paths as evidence
   - Document findings before coding

4. **Current Status:**
   - Phase A: 95% complete
   - Frontend: Fully functional
   - Editor preview: Cosmetic issue only
   - Ready for Phase B

---

## 📞 Quick Reference

**Build Commands:**
```bash
npm run dev              # Frontend watch mode (fast iteration)
npm run build            # Production builds for everything
```

**Key Files:**
- Editor: `app/blocks/src/create-post/edit.tsx`
- Frontend: `app/blocks/src/create-post/frontend.tsx`
- Render: `app/blocks/src/create-post/render.php`
- Block Loader: `app/blocks/Block_Loader.php`

**Voxel Templates:**
- Field templates: `themes/voxel/templates/widgets/create-post/*-field.php`
- Widget: `themes/voxel/app/widgets/create-post.php`

**Documentation:**
- Technical Summary: `docs/conversions/create-post-technical-summary.md` ⭐
- Phase A Status: `docs/conversions/create-post-phase-a-95%-complete.md`
- Build Fixes: `docs/project-log/tasks/task-create-post-phase-a-build-fixes-nov-23-2025.md`

---

**Session Ready:** ✅ All prerequisites documented
**Next Step:** Read technical summary, then start Phase B field rendering

---

**Created:** November 23, 2025
**Last Updated:** November 23, 2025

