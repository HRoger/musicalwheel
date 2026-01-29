# ⚠️ CRITICAL INSTRUCTIONS FOR AI AGENTS - READ THIS FIRST

**Last Updated:** December 2025
**Architecture:** All-in FSE Child Theme (voxel-fse)
**Methodology:** Discovery-First, Evidence-Based, 1:1 Voxel Matching
**Block Strategy:** Plan C+ (Headless-Ready, API-Driven)

---

## 🚫 ABSOLUTELY FORBIDDEN

You are **NOT permitted** to:

### ❌ Architecture Violations
- **NEVER** use PHP rendering for blocks (`render.php`, `render_callback`)
- **NEVER** use `ServerSideRender` component
- **NEVER** implement blocks that are not headless-ready
- **NEVER** mix PHP and React logic for the same block component

### ❌ Assumptions & Guessing
- **NEVER** guess ANY implementation details
- **NEVER** assume Voxel theme structure or file locations
- **NEVER** assume you know where files are located (e.g., "app/dynamic-tags/")
- **NEVER** use "typical WordPress patterns" or "common approaches"
- **NEVER** proceed without evidence from actual Voxel code
- **NEVER** create files in paths that might conflict with parent theme

### ❌ Code Before Discovery
- **NEVER** write ANY code before completing discovery requirements
- **NEVER** implement features without analyzing Voxel's actual implementation
- **NEVER** port functionality without understanding Voxel's approach
- **NEVER** skip the discovery phase "to save time"

### ❌ Parent Theme Conflicts
- **NEVER** create files with same names as Voxel parent (e.g., `base-controller.php`)
- **NEVER** create directories with same paths as Voxel (e.g., `controllers/templates/`)
- **NEVER** use namespace `Voxel\` for child theme code (use `VoxelFSE\`)
- **NEVER** modify Voxel parent theme files directly

---

## ✅ MANDATORY REQUIREMENTS

You **MUST** follow these rules:

### 0. Check Project Memory FIRST

**Before implementing ANY pattern:**

```bash
# Read the project memory for existing solutions
Read .mcp-memory/memory.json

# Search for relevant patterns (e.g., "portal", "popup", "backdrop")
# The memory contains solved patterns like:
# - React Portal (use react-dom, NOT @wordpress/element)
# - Blurable Mixin (mousedown + document listener + ref contains)
# - CSS inheritance rules
```

**If a pattern exists in memory, USE IT. Don't reinvent.**

### 1. Discovery-First Methodology

**Before ANY implementation:**

```bash
# Step 1: Read documentation
Read docs/voxel-discovery/
Read docs/voxel-documentation/
Read CLAUDE.md

# Step 2: Search broadly (ENTIRE Voxel theme)
grep -r "feature_name" themes/voxel/
find themes/voxel -name "*feature*"

# Step 3: Analyze findings
Read found files
Document structure
Map dependencies

# Step 4: Verify with evidence
Provide file paths
Show code snippets
Confirm approach
```

**Example - WRONG vs RIGHT:**

❌ **WRONG:**
```php
// Assuming dynamic tags are in app/dynamic-tags/
require_once VOXEL_PATH . '/app/dynamic-tags/tags.php';
```

✅ **RIGHT:**
```bash
# First, discover actual location
grep -r "dynamic.*tag" themes/voxel/
# Result: Found in themes/voxel/app/dynamic-data/

# Then implement based on evidence
require_once VOXEL_PATH . '/app/dynamic-data/tags.php';
```

### 2. 1:1 Voxel Matching

**When implementing features:**

✅ **Match Voxel's EXACT:**
- HTML structure
- CSS classes (including prefixes like `ts-`)
- JavaScript/Vue logic
- SVG icons and markup
- Component methods and properties
- Data attributes
- Event handlers

**Example - Media Popup:**

❌ **WRONG (Generic implementation):**
```html
<div class="media-popup">
  <div class="file-list">
    <div class="file-item">...</div>
  </div>
</div>
```

✅ **RIGHT (1:1 Voxel match):**
```html
<div class="ts-media-library">
  <div class="ts-file-list">
    <div class="ts-file">...</div>
  </div>
</div>
```

### 3. Evidence-Based Claims

**Every statement requires proof:**

❌ **WRONG:**
```
"Voxel uses dynamic tags in the widgets system"
```

✅ **RIGHT:**
```
"Voxel uses dynamic tags in the widgets system
Evidence: themes/voxel/app/widgets/post-title.php:45
Code: echo \Voxel\render_dynamic_tags($content);
"
```

### 4. TypeScript Strict Mode Compliance

**CRITICAL: All TypeScript code MUST pass strict mode compilation (`strict: true`).**

#### Never Use `any` Type

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
// WRONG - unsafe type assertion
const data = JSON.parse(localStorage.getItem('data')) as MyType;

// CORRECT - validate at runtime with type guard
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

#### TypeScript Compliance Checklist

- [ ] **No `any` types** used anywhere in codebase
- [ ] All interfaces defined in `types/index.ts` or `types.ts`
- [ ] Generic hooks used for type-safe API responses
- [ ] Props interfaces defined for all components
- [ ] Optional properties marked with `?` suffix
- [ ] Nullable values typed as `Type | null`
- [ ] React hooks imported from `'react'` (not `@wordpress/element`)
- [ ] Type guards used for runtime validation of external data
- [ ] Build passes with `strict: true` in tsconfig.json

### 5. Autoloader Conflict Prevention

**Critical for child theme development:**

✅ **ALWAYS check before creating files:**

```bash
# Before creating: app/controllers/my-controller.php
# Check if parent has same file:
ls themes/voxel/app/controllers/my-controller.php

# If exists, use different name:
# Child: app/controllers/fse-my-controller.php
# OR different path:
# Child: app/controllers/my-features/my-controller.php
```

**Why?** Voxel uses `locate_template()` which searches child theme first!

**Safe Patterns:**
- ✅ Prefix filenames: `fse-base-controller.php`
- ✅ Different paths: `controllers/fse-templates/`
- ✅ Different namespace: `VoxelFSE\Controllers`

**Dangerous Patterns:**
- ❌ Same filename: `base-controller.php`
- ❌ Same path: `controllers/templates/`
- ❌ Same namespace: `Voxel\Controllers`

### 6. Check Voxel Before ANY Change

**Before creating, editing, updating, or deleting ANY file:**

```bash
# 1. Identify the feature/functionality
Feature: "Media upload popup"

# 2. Find Voxel's implementation
grep -r "media.*popup" themes/voxel/
find themes/voxel -name "*media*"

# 3. Read Voxel's actual code
cat themes/voxel/path/to/found/file.php

# 4. Understand approach
- What classes does Voxel use?
- What methods are available?
- What HTML structure?
- What CSS classes?
- What JavaScript logic?

# 5. Implement 1:1 match in child theme
# Keep same structure, just adapt namespace/paths
```

### 7. Plan C+ Block Architecture

**ALL new blocks MUST use Plan C+ Architecture:**

1. **Headless-Ready:** No PHP rendering. Logic lives in React components.
2. **API-Driven:** Fetch data via REST API (`useBlockConfig`), not `render_callback`.
3. **Database Efficient:** Save JSON configuration (`vxconfig`) in `post_content`, not heavy HTML.
4. **Shared Components:** Use `SharedBlockComponent` for both Editor and Frontend.
5. **Voxel Grid Icon:** Always use `VoxelGridIcon` component.

**Reference:** `docs/block-conversions/voxel-widget-conversion-master-guide.md`

---

## 📋 Discovery Checklist

Before implementing any feature, complete this checklist:

### Phase 1: Documentation Review
- [ ] Read `docs/voxel-discovery/` for similar features
- [ ] Check `docs/voxel-documentation/` for feature specs
- [ ] Review `CLAUDE.md` for architecture patterns
- [ ] Check `docs/roadmap/` for implementation plans

### Phase 2: Voxel Code Discovery
- [ ] Search entire Voxel theme (not subdirectories)
- [ ] Find all relevant files
- [ ] Read actual implementation code
- [ ] Document file paths and line numbers
- [ ] Identify dependencies and related classes

### Phase 3: Structure Analysis
- [ ] Map out class hierarchy
- [ ] Identify HTML structure and CSS classes
- [ ] Document JavaScript/Vue components
- [ ] Note data flow and hooks
- [ ] List all methods and properties

### Phase 4: Conflict Check
- [ ] Verify no filename conflicts with parent
- [ ] Verify no path conflicts with parent
- [ ] Verify namespace is `VoxelFSE\` not `Voxel\`
- [ ] Check for `locate_template()` issues

### Phase 5: Implementation Plan
- [ ] Create implementation plan based on evidence
- [ ] Get user approval if uncertain
- [ ] Implement with 1:1 Voxel matching
- [ ] Test thoroughly

---

## 🎯 Success Criteria

Your implementation is correct when:

✅ **Evidence-Based:**
- Every decision backed by Voxel code reference
- File paths and line numbers provided
- Code snippets shown as proof

✅ **1:1 Match:**
- HTML structure matches Voxel exactly
- CSS classes use same prefixes (ts-, etc.)
- JavaScript logic follows Voxel patterns
- Component methods match Voxel's API

✅ **No Conflicts:**
- No autoloader conflicts with parent
- Different filenames/paths from parent
- Namespace is `VoxelFSE\`
- Parent theme classes still load correctly

✅ **Functional:**
- Feature works as in Voxel
- No errors or warnings
- Performance comparable to Voxel
- Tests passing

---

## 🔍 Search Pattern Examples

### Broad Discovery (Start Here)
```bash
# Find all files related to "timeline"
find themes/voxel -type f -name "*timeline*"

# Search all PHP files for "timeline" reference
grep -r "timeline" themes/voxel --include="*.php"

# Search all JS/Vue files for "timeline"
grep -r "timeline" themes/voxel --include="*.js" --include="*.vue"
```

### Targeted Discovery (After Broad)
```bash
# Once you know the directory exists
grep -r "class.*Timeline" themes/voxel/app/social/

# Find specific method implementations
grep -rn "function.*create_post" themes/voxel/app/

# Find Vue component definitions
grep -rn "export default" themes/voxel/assets/src/components/
```

### Evidence Collection
```bash
# Get exact file path
realpath themes/voxel/app/found/file.php

# Get line number with context
grep -rn -A 5 -B 5 "search_term" themes/voxel/

# Extract specific class/function
sed -n '/class Timeline/,/^}/p' themes/voxel/app/social/timeline.php
```

---

## 📚 Required Reading Before Starting

1. **Architecture:** `CLAUDE.md` - Project guide
2. **Current State:** `.mcp-memory/memory.json` - Knowledge graph
3. **Voxel Structure:** `docs/voxel-discovery/` - Theme analysis
4. **Feature Specs:** `docs/voxel-documentation/` - Official docs
5. **Recent Changes:** `docs/CHANGELOG.md` - What changed
6. **Active Plan:** `docs/roadmap/02-phase-2-implementation-v2.0.md` - Current phase

---

## 🚨 When in Doubt

**If ANY of these apply, STOP and ASK:**

- ❓ Can't find Voxel implementation
- ❓ Multiple possible approaches found
- ❓ Conflicting information in docs
- ❓ Uncertain about file naming/location
- ❓ Don't understand Voxel's approach
- ❓ Feature seems to not exist in Voxel

**DON'T:**
- Guess the implementation
- Use "common patterns"
- Skip discovery
- Assume Voxel structure

**DO:**
- Ask user for clarification
- Request additional context
- Suggest discovery tasks
- Propose verification steps

---

## 💡 Example Workflow

### Scenario: Implement Media Upload Popup

#### ❌ WRONG Approach:
```php
// Just guessing implementation
class Media_Popup {
    public function render() {
        echo '<div class="media-popup">...</div>';
    }
}
```

#### ✅ RIGHT Approach:

**Step 1: Discover**
```bash
grep -r "media.*popup" themes/voxel/
# Found: themes/voxel/app/widgets/file-field.php
# Found: themes/voxel/assets/src/components/media-popup.vue
```

**Step 2: Analyze**
```bash
cat themes/voxel/app/widgets/file-field.php
# Classes found: ts-media-library, ts-file-list, ts-file
cat themes/voxel/assets/src/components/media-popup.vue
# Methods found: selectFile, removeFile, uploadFile
```

**Step 3: Document**
```
Evidence:
- File: themes/voxel/app/widgets/file-field.php:123
- Classes: ts-media-library, ts-file-list, ts-file
- Component: themes/voxel/assets/src/components/media-popup.vue
- Methods: selectFile(), removeFile(), uploadFile()
```

**Step 4: Implement (1:1 match)**
```php
// Child theme: themes/voxel-fse/app/blocks/src/media-upload/
// Using EXACT same structure as Voxel
class FSE_Media_Popup {
    public function render() {
        // 1:1 HTML match with Voxel
        echo '<div class="ts-media-library">';
        echo '  <div class="ts-file-list">';
        echo '    <div class="ts-file">...</div>';
        echo '  </div>';
        echo '</div>';
    }
}
```

**Step 5: Verify**
- HTML structure matches Voxel ✓
- CSS classes use ts- prefix ✓
- Methods match Voxel's API ✓
- No parent conflicts ✓

---

## 🎓 Core Principles

1. **Evidence Over Assumptions:** Code first, assumptions never
2. **Discovery Over Speed:** Slow and correct > fast and wrong
3. **Matching Over Innovation:** 1:1 match > clever solutions
4. **Prevention Over Fixes:** Avoid conflicts > fix conflicts
5. **Questions Over Guesses:** Ask > assume

---

**Remember:** The Voxel theme IS the specification. When in doubt, read the Voxel code.

**Last Major Update:** November 2025 - Architecture consolidation to all-in child theme
