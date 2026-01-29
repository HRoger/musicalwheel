# Generic Block/Widget 1:1 Comparison Prompt Template

## Copy-Paste Template (Fill in the bracketed sections)

---

**Task:** Compare and fix the `[Post feed (VX)]` voxel-fse block to achieve 1:1 match with the original Voxel Elementor widget.

**Original Voxel Widget URL:** `[http://voxel.local/stays/wp-admin/post.php?post=164&action=elementor]`

**voxel-fse Block URL:** `[http://musicalwheel.local/vx-stays/wp-admin/post.php?post=128&action=edit]`

**Block Source Location:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/[BLOCK_NAME]/`

**Requirements:**

1. **Browser Automation Workflow:**
   - Open both URLs in separate tabs
   - Use JavaScript execution to extract the complete HTML structure from both
   - Compare DOM hierarchy, CSS classes, data attributes, inline styles, and event handlers
   - Document ALL differences with specific examples

2. **1:1 Matching Criteria (CRITICAL):**
   - HTML structure must match EXACTLY (same elements, same nesting)
   - CSS classes must match EXACTLY (same names, same order)
   - Data attributes must match EXACTLY (e.g., `data-icon`, `data-id`)
   - ARIA attributes must match (for accessibility)
   - JavaScript hooks/event handlers must match (e.g., `@click`, `data-*` attributes)

3. **Evidence-Based Analysis:**
   - Every difference you identify must include:
     - **Original:** `[exact HTML/class from Voxel widget]`
     - **Current:** `[exact HTML/class from voxel-fse block]`
     - **File Location:** `[file path:line number]` where the fix needs to be made

4. **Implementation Plan:**
   - Create a detailed plan showing ALL required changes
   - Prioritize changes by impact (structure → classes → attributes → styles)
   - Include code snippets for each fix
   - Reference the specific files to modify (edit.tsx, render.php, style.scss, etc.)

5. **Validation:**
   - After implementing fixes, re-compare both versions in the browser
   - Screenshot comparison to verify visual match
   - DOM comparison to verify structural match

**Additional Context (if applicable):**
- [Any specific issues you've noticed]
- [Any particular sections of the widget to focus on]
- [Known differences that are intentional and should be ignored]

---

## Usage Notes

1. **Local Development URLs:** If testing locally with LocalWP, your URLs will typically be:
   - Original: `http://musicalwheel.local/[page-with-elementor-widget]/`
   - voxel-fse: `http://musicalwheel.local/[page-with-fse-block]/`

2. **Finding Original Widgets:** Original Voxel widgets can be found in:
   - Voxel demo pages (if available locally)
   - Test pages you've created with Elementor
   - Production Voxel sites for reference

3. **Common Block Names:**
   - `create-post`
   - `search-form`
   - `post-feed`
   - `advanced-list`
   - `timeline`
   - `messages`
   - `login`
   - `navbar`
   - `popup-kit`
   - etc.

---

## Example: Filled Template

**Task:** Compare and fix the `create-post` voxel-fse block to achieve 1:1 match with the original Voxel Elementor widget.

**Original Voxel Widget URL:** `http://musicalwheel.local/test-create-post-elementor/`

**voxel-fse Block URL:** `http://musicalwheel.local/test-create-post-fse/`

**Block Source Location:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/`

**Requirements:**
[... same requirements as above ...]

**Additional Context:**
- Focus on the file upload section - the styling seems off
- The submit button classes don't match
- Ignore the wrapper div class differences (intentional FSE adaptation)

---

## Quick Copy Template (Minimal Version)

```
Compare and fix [BLOCK_NAME] to 1:1 match Voxel original.

Original: [URL]
voxel-fse: [URL]

Use browser automation to:
1. Extract HTML from both
2. Document ALL differences (structure, classes, attributes)
3. Create implementation plan with file:line references
4. Fix and validate

Critical: EXACT match required for HTML structure and CSS classes.
```

---

**Last Updated:** 2025-12-20
