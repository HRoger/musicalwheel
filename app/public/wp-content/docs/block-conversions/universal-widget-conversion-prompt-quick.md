# Universal Widget Conversion Prompt - Quick Reference

**Use this prompt template to convert any Voxel Elementor widget to a Gutenberg FSE block.**


---

## 🔧 Variable Substitution

**⚠️ IMPORTANT: Before proceeding, replace ALL variables in this prompt with the actual values provided below.**

### Variable Assignment

```
WIDGET_NAME = nested-accordion
block-name = nested-accordion
Block Title = Nested Accordion
Widget Name = Nested Accordion
Widget_Class = Nested_Accordion
BlockName = NestedAccordion
widget_name = nested_accordion
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

See full prompt: docs/conversions/universal-widget-conversion-prompt.md
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
- **Reference Blocks:** `themes/voxel-fse/app/blocks/src/search-form/`, `create-post/`
- **⚠️ Dynamic Tags:**
  - **Control:** `themes/voxel-fse/app/blocks/src/shared/controls/DynamicTagTextControl.tsx`
  - **Parser:** `themes/voxel-fse/app/dynamic-data/parser/`
  - **Docs:** `docs/voxel-dynamic-tag-builder/`

---

**Version:** 1.0.0  
**Last Updated:** December 2025

