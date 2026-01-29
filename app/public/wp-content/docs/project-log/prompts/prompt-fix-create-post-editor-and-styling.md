# Prompt: Fix Create Post Block Editor Preview and Frontend Styling

**Date Created:** November 21, 2025
**Phase:** Phase A - Foundation (Completion)
**Priority:** CRITICAL
**Estimated Time:** 2-3 hours

---

## Context

We've been implementing the create-post FSE block by converting Voxel's Elementor widget to a WordPress FSE block with React on both editor and frontend. The previous session resolved the ES module import issue by creating a dual build system (ES modules for editor, IIFE for frontend).

**Current Status:**
- ✅ Block appears in inserter and is configurable
- ✅ Frontend React component mounts successfully (no module errors)
- ✅ Form fields render on frontend
- ❌ Editor preview shows "Loading form..." instead of field list
- ❌ Frontend form has no styling (Voxel CSS not applying)

**Read First:**
- `docs/project-log/tasks/task-session-create-post-block-phase-a-troubleshooting.md` - Summary of troubleshooting previous session
- `docs/project-log/prompts/create-post-block-implementation.md` - Full Create Post Block Implementation Summary
- `docs/conversions/create-post-analysis.md` - Analysis of Voxel's Elementor widget
- `docs/conversions/create-post-phase-a-complete.md` - What we've accomplished so far
- `docs/conversions/create-post-architecture-update.md` - Architecture update
- `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md` - Mandatory rules

---

## Your Task

Complete Phase A of the create-post block by fixing two critical issues:

### Issue 1: Editor Preview Not Rendering (PRIORITY 1)

**Current Behavior:**
- User selects "Places" post type in block settings
- Editor shows "Preview: This shows how the form will appear on the frontend"
- Below that shows "Loading form..." continuously
- ServerSideRender is stuck in loading state

**Expected Behavior:**
- When post type is selected, editor should show:
  ```
  📝 Editor Preview
  Post Type: Places | Fields: 23

  Form Fields:
  • General (ui-step)
  • Title (title) *
  • Text (text)
  • Text Editor (texteditor)
  • Email (email)
  ...and 18 more fields

  💡 The interactive React form will appear on the frontend
  ```

**Investigation Steps:**

1. **Check if render.php is being called:**
   - Add `error_log('RENDER.PHP CALLED - Context: ' . ($is_editor_preview ? 'editor' : 'frontend'));` at top of render.php
   - Check WordPress debug log: `tail -f wp-content/debug.log`

2. **Verify REST API response:**
   - Open browser DevTools Network tab
   - Filter for "block-renderer" requests
   - Check response from ServerSideRender REST call
   - Look for PHP errors or unexpected HTML

3. **Test $is_editor_preview variable:**
   - Add `error_log('REST_REQUEST: ' . (defined('REST_REQUEST') ? 'true' : 'false'));`
   - Verify conditional logic is working

4. **Check ServerSideRender configuration:**
   - File: `themes/voxel-fse/app/blocks/src/create-post/edit.tsx` (lines 162-165)
   - Ensure block name matches: `voxel-fse/create-post`
   - Verify attributes are being passed correctly

**Possible Solutions to Try:**

A. **Replace ServerSideRender with Custom Preview:**
   - Remove ServerSideRender component
   - Create custom preview in edit.tsx using post type data
   - Display field list directly in React (no PHP needed)

B. **Fix REST API Context Detection:**
   - Try different method to detect editor preview
   - Check `$_GET` or `$_SERVER` variables
   - Use `wp_doing_ajax()` or similar WordPress functions

C. **Force ServerSideRender Refresh:**
   - Add key prop to ServerSideRender that changes when post type changes
   - Example: `<ServerSideRender key={attributes.postTypeKey} ... />`

**Files to Modify:**
- `themes/voxel-fse/app/blocks/src/create-post/edit.tsx`
- `themes/voxel-fse/app/blocks/src/create-post/render.php`

---

### Issue 2: Frontend Styling Missing (PRIORITY 2)

**Current Behavior:**
- Form renders on frontend with all fields
- Zero CSS styling applied
- Looks like unstyled HTML form with browser defaults
- No spacing, borders, or layout

**Expected Behavior:**
- Form should have Voxel's professional styling
- Styled input fields with borders, padding, focus states
- Proper spacing and layout
- Button styling matches Voxel design

**Investigation Steps:**

1. **Verify CSS files are loading:**
   - View page source
   - Search for "forms.css" and "create-post.css"
   - Check if `<link rel="stylesheet">` tags exist
   - Look for 404 errors in Network tab

2. **Check CSS handles are registered:**
   - Add `error_log('Voxel function exists: ' . (function_exists('voxel') ? 'yes' : 'no'));`
   - Add `error_log('CSS registered: ' . (wp_style_is('vx:forms.css', 'registered') ? 'yes' : 'no'));`

3. **Inspect HTML structure:**
   - Use browser DevTools to inspect form elements
   - Check if CSS classes are present on elements
   - See which styles are applied (if any)
   - Compare with Voxel's native widget HTML structure

4. **Compare with Voxel Widget:**
   - Create a test page with Voxel's native create-post widget (Elementor)
   - View source and compare HTML structure
   - Check what CSS files Voxel widget loads
   - Look for differences in container classes or data attributes

**Possible Solutions to Try:**

A. **Use wp_print_styles Instead:**
   ```php
   // In render.php
   if ( function_exists( 'voxel' ) ) {
       wp_print_styles( ['vx:commons.css', 'vx:forms.css', 'vx:create-post.css'] );
   }
   ```

B. **Load Voxel Assets Earlier:**
   - Hook into Voxel's asset loading system
   - Check `themes/voxel/app/controllers/assets-controller.php`
   - Ensure styles are registered before we try to enqueue

C. **Add Missing Container Classes:**
   - Voxel might require specific parent classes
   - Add wrapper div with class `elementor-widget-voxel-create-post`
   - Add data attributes that Voxel expects

D. **Include Voxel JavaScript:**
   - Voxel forms might need JS initialization
   - Enqueue `vx:create-post.js` script
   - Check if forms need Vue.js runtime

E. **Inline Critical CSS:**
   - As temporary fallback, copy essential CSS from Voxel
   - Add inline styles to render.php or style.css
   - Ensure form is usable while debugging CSS loading

**Files to Modify:**
- `themes/voxel-fse/app/blocks/src/create-post/render.php` (lines 158-163)
- `themes/voxel-fse/app/blocks/src/create-post/style.css` (if needed)

**Files to Reference:**
- `themes/voxel/assets/dist/forms.css` - Target CSS file
- `themes/voxel/assets/dist/create-post.css` - Target CSS file
- `themes/voxel/templates/widgets/create-post.php` - Voxel widget template
- `themes/voxel/app/widgets/create-post.php` - Widget class with style dependencies

---

## Success Criteria

### ✅ Issue 1 Fixed When:
1. Editor preview shows field list (not "Loading form...")
2. Field names and types are visible in editor
3. Post type label displays correctly
4. No console errors related to ServerSideRender

### ✅ Issue 2 Fixed When:
1. Form inputs have visible borders and styling
2. Layout matches Voxel's design (spacing, alignment)
3. Buttons are styled with Voxel's button classes
4. Focus states work on inputs
5. Can verify CSS files load in Network tab

### ✅ Phase A Complete When:
- Both issues above are fixed
- Form is visually usable on frontend
- Editor preview provides useful feedback
- No console errors on editor or frontend
- Ready to proceed to Phase B (field rendering)

---

## Debugging Tools

### Check WordPress Debug Log
```bash
tail -f wp-content/debug.log
```

### Check Voxel CSS Registration
```php
// Add to render.php temporarily
error_log('CSS handles registered:');
foreach (['vx:commons.css', 'vx:forms.css', 'vx:create-post.css'] as $handle) {
    error_log($handle . ': ' . (wp_style_is($handle, 'registered') ? 'YES' : 'NO'));
}
```

### View ServerSideRender Response
- Open DevTools → Network tab
- Filter: "block-renderer"
- Select request → Preview tab
- Should show HTML that render.php outputs

### Compare HTML with Voxel Widget
```bash
# View Voxel widget template
cat themes/voxel/templates/widgets/create-post.php | less

# Search for CSS classes
grep -r "ts-form" themes/voxel/templates/
```

---

## Build Commands (If Needed)

```bash
# Rebuild editor blocks
npm run build:blocks

# Rebuild frontend React
npm run build:frontend

# Development mode with HMR
npm run dev
```

---

## Important Notes

### DO NOT:
- ❌ Modify Voxel parent theme files
- ❌ Create new build configurations (we just fixed that)
- ❌ Change the dual build system (IIFE + ES modules)
- ❌ Start Phase B field rendering until Phase A is complete
- ❌ Modify frontend.tsx React component structure

### DO:
- ✅ Follow discovery-first methodology (read Voxel code first)
- ✅ Match Voxel's HTML structure and CSS classes exactly
- ✅ Test each change in both editor and frontend
- ✅ Document solutions in task file
- ✅ Provide evidence (file paths, code snippets) for claims

### Testing Checklist:
- [ ] Block appears in inserter
- [ ] Post type dropdown works
- [ ] Editor shows field list preview
- [ ] Frontend form renders
- [ ] Frontend form has styling
- [ ] Input fields are styled
- [ ] Buttons are styled
- [ ] No console errors
- [ ] No PHP errors in debug log

---

## Expected Outcome

By the end of this session, you should have:

1. **Working editor preview** showing field list when post type is selected
2. **Styled frontend form** using Voxel's CSS
3. **Documentation** of solution in task file
4. **Screenshots** showing before/after (if user provides them)
5. **Clear next steps** for Phase B field rendering

**Estimated Time:** 2-3 hours

**Next Phase After This:** Phase B - Field Rendering (implement all 30 Voxel field types)

---

## Quick Start

1. Read the full summary: `docs/project-log/tasks/task-session-create-post-block-phase-a-troubleshooting.md`
2. Start with Issue 1 (Editor Preview) - it's blocking user workflow
3. Then fix Issue 2 (Frontend Styling) - it's blocking testing
4. Document your solution approach
5. Test thoroughly before moving to Phase B

Good luck! 🚀
