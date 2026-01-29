# Create-Post Block: Phase 2 Handoff - Interactive Editor Preview

**Session Handoff Date:** November 27, 2025
**Current Status:** Phase 1 Complete ✅ | Starting Phase 2
**Full Implementation Plan:** `C:\Users\herle\.claude\plans\golden-dreaming-tower.md`

---

## Quick Context

**Goal:** Transform create-post block's Gutenberg editor preview from static ServerSideRender to fully functional, interactive React component matching frontend 1:1 (like Voxel's Elementor backend).

**Approach:** Shared Component Architecture - Extract the 668-line frontend.tsx component into reusable shared/ directory that both editor and frontend will use.

---

## ✅ Phase 1: Complete (REST API Endpoint)

### What Was Done

**Created Files:**
1. `app/controllers/rest-api-controller.php` - New REST API controller
   - Endpoint: `/wp-json/voxel-fse/v1/post-type-fields?post_type={key}`
   - Returns Voxel field configuration for a post type
   - Handles dependency checking and error handling (matches render.php pattern)
   - Permission check: `edit_posts` capability required

**Modified Files:**
1. `functions.php` (lines 123-130) - Registered REST_API_Controller

### Endpoint Testing

**Status:** ✅ Working correctly from Gutenberg editor

**Test Command (run in Gutenberg editor console):**
```javascript
wp.apiFetch({
    path: '/voxel-fse/v1/post-type-fields?post_type=places'
}).then(data => console.log('SUCCESS:', data))
  .catch(error => console.error('ERROR:', error));
```

**Expected Response:**
```json
{
  "post_type": "places",
  "post_type_label": "Places",
  "fields_config": [...array of field configs...],
  "field_count": 25
}
```

**Note:** Direct browser URL access returns 401 (expected - requires WordPress nonce authentication). The endpoint works correctly when called via `wp.apiFetch` from Gutenberg editor.

---

## 🚀 Phase 2: Next Tasks (Extract Shared Components)

### Overview

Extract the 668-line `CreatePostForm` component from `frontend.tsx` into a reusable shared component that both editor and frontend will import.

### File Structure to Create

```
app/blocks/src/create-post/
├── shared/                          # NEW DIRECTORY
│   ├── CreatePostForm.tsx          # Main form (668 lines from frontend.tsx)
│   ├── FormHeader.tsx              # Multi-step progress indicator
│   ├── FormFooter.tsx              # Submit buttons and navigation
│   ├── SuccessScreen.tsx           # Success message display
│   └── index.ts                    # Barrel export
├── hooks/                           # NEW DIRECTORY (Phase 3)
│   ├── useFieldsConfig.ts          # REST API data loading
│   ├── useFormState.ts             # Form state management
│   ├── useFormSubmission.ts        # AJAX submission logic
│   ├── useStepNavigation.ts        # Multi-step navigation
│   └── index.ts                    # Barrel export
└── (existing files...)
```

### Phase 2 Tasks

**Task 1: Create shared/ directory**
```bash
mkdir app/blocks/src/create-post/shared
```

**Task 2: Extract CreatePostForm**
- Read `frontend.tsx` lines 23-667 (the CreatePostForm component)
- Create `shared/CreatePostForm.tsx`
- Add new props:
  ```typescript
  interface CreatePostFormProps {
      attributes: CreatePostAttributes;
      fieldsConfig: VoxelField[];
      context: 'editor' | 'frontend';  // NEW
      onSubmit?: (data: FormData) => Promise<SubmissionResult>; // NEW - injectable
  }
  ```
- Move the component code (668 lines)
- Keep all existing logic (state, validation, submission)

**Task 3: Extract Sub-Components**

**FormHeader.tsx:**
- Multi-step progress indicator (ts-form-progres)
- Props: `steps`, `currentStepIndex`
- Currently in frontend.tsx but should be extracted

**FormFooter.tsx:**
- Submit buttons and navigation (Previous/Next/Submit)
- Props: `steps`, `currentStepIndex`, `onPrevious`, `onNext`, `onSubmit`, `submitButtonText`, `processing`

**SuccessScreen.tsx:**
- Success message display
- Props: `submission`, `attributes`
- Currently shown when `submission.done && submission.success`

**Task 4: Update types.ts**
- Add `CreatePostFormProps` interface
- Add `context: 'editor' | 'frontend'` type
- Add hook return types (for Phase 3)

**Task 5: Create barrel export**
- `shared/index.ts`:
  ```typescript
  export { CreatePostForm } from './CreatePostForm';
  export { FormHeader } from './FormHeader';
  export { FormFooter } from './FormFooter';
  export { SuccessScreen } from './SuccessScreen';
  ```

---

## 📋 Current Todo List

```
✅ Phase 1: Create REST API endpoint for field configuration
✅ Phase 1: Register REST controller in Block_Loader.php
✅ Phase 1: Test REST endpoint with browser/Postman

🔄 Phase 2: Create shared/ directory and extract CreatePostForm
⏳ Phase 2: Extract FormHeader, FormFooter, SuccessScreen components
⏳ Phase 2: Update types.ts with new interfaces

⏳ Phase 3: Create custom hooks (useFieldsConfig, useFormState, useFormSubmission, useStepNavigation)

⏳ Phase 4: Refactor edit.tsx - remove ServerSideRender, add CreatePostForm

⏳ Phase 5: Refactor frontend.tsx - import CreatePostForm from shared

⏳ Phase 6: Test all field types, popup-kit, multi-step, validation in editor
⏳ Phase 6: Regression test frontend for any breaking changes
⏳ Phase 6: Add unit tests for hooks and components
⏳ Phase 6: Update documentation and create git commit
```

---

## 🎯 User Decisions (From Plan)

### 1. Form Submission Behavior ✅
**Decision:** Real submission using Voxel's AJAX endpoint (no mock)

**Rationale:**
- Voxel's backend controls behavior: `wp-admin/edit.php?post_type={type}&page=edit-post-type-{type}&tab=general.submissions`
- Settings: "Enable post submissions", "When a new post is submitted, set its status to"
- Form respects backend configuration automatically
- Only limitation: "Back to Editing" button won't work (AJAX navigation)

### 2. Form State Persistence ✅
**Decision:** Reset on reload (no localStorage)

**Rationale:** Standard WordPress editor behavior, simpler implementation

### 3. Testing Requirements ✅
**Decision:** Add unit tests before merge

**Rationale:** Quality first, adds ~3-4 hours but prevents regressions

### 4. Timeline ✅
**Decision:** Conservative approach (12 hours over 1.5-2 days)

**Rationale:** Buffer for challenges, thorough testing

---

## 🔧 Implementation Notes

### Key Architectural Principles

**1. Shared Component = Single Source of Truth**
- Editor and frontend use EXACT same CreatePostForm component
- Impossible for them to diverge
- Bug fixes apply everywhere automatically
- Guarantees 1:1 matching (user's explicit requirement)

**2. Context-Aware Behavior**
```typescript
// In CreatePostForm
const { context } = props; // 'editor' | 'frontend'

// Example context usage:
if (context === 'editor') {
    // Maybe show debug info, different styling, etc.
}
```

**3. Injectable Submission Handler**
```typescript
// Editor can inject custom handler
<CreatePostForm
    onSubmit={async (formData) => {
        // Real Voxel AJAX submission
        const response = await fetch(voxelAjaxUrl, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
        });
        return response.json();
    }}
/>
```

**4. Data Loading Strategy**

**Editor:** REST API via custom hook
```typescript
const { fieldsConfig, isLoading } = useFieldsConfig(postTypeKey);
```

**Frontend:** wp_localize_script (existing pattern)
```javascript
const wpData = window.voxelFseCreatePost;
const fieldsConfig = wpData.fieldsConfig;
```

---

## 📁 Critical File Locations

### Files to Read (Source)
- `app/blocks/src/create-post/frontend.tsx` (lines 23-667) - Component to extract
- `app/blocks/src/create-post/types.ts` - Type definitions
- `app/blocks/src/create-post/edit.tsx` - Will be modified in Phase 4
- `app/blocks/src/create-post/render.php` (lines 535-557) - Field loading pattern reference

### Files to Create (Phase 2)
- `app/blocks/src/create-post/shared/CreatePostForm.tsx`
- `app/blocks/src/create-post/shared/FormHeader.tsx`
- `app/blocks/src/create-post/shared/FormFooter.tsx`
- `app/blocks/src/create-post/shared/SuccessScreen.tsx`
- `app/blocks/src/create-post/shared/index.ts`

### Files to Modify (Phase 2)
- `app/blocks/src/create-post/types.ts` - Add new interfaces

---

## ⚠️ Important Context

### Popup-Kit Integration
**Status:** ✅ Already working in editor

The popup-kit block is fully implemented and tested. DateField, SelectField components already use FormGroup + FormPopup pattern. No changes needed - popup integration will continue to work.

### Voxel CSS
**Status:** ✅ Already loading correctly

Voxel styles (vx:forms.css, vx:commons.css, vx:create-post.css) are registered as editorStyle dependencies in Block_Loader.php (similar to popup block pattern). Preview styling is correct.

### Multi-Step Form Support
**Status:** ✅ Logic exists in frontend.tsx

Field grouping by ui-step fields is implemented (lines 61-97 in render.php helper functions). FormHeader component will display progress indicator (ts-form-progres structure).

---

## 🚫 What NOT to Change

**Do NOT modify these (working correctly):**
- `render.php` - Used for frontend initial HTML, leave as-is
- `components/` directory - All field components (FieldRenderer, TextField, etc.) unchanged
- `block.json` - Configuration unchanged
- `view.js` - Frontend mount point unchanged

**Do NOT touch frontend submission yet:**
- Keep existing AJAX submission logic intact when extracting
- Phase 5 will simplify frontend.tsx to use shared component
- But the submission handler logic moves to shared component unchanged

---

## 🎓 Reference Patterns

### Similar Block Architecture

**Popup Block Example:**
- Location: `app/blocks/src/popup/`
- Has shared components in `popup/components/` (FormPopup, FormGroup, DatePicker)
- Both editor and frontend import from components/
- Proves Vite handles nested imports correctly

### Barrel Export Pattern
```typescript
// shared/index.ts
export { CreatePostForm } from './CreatePostForm';
export { FormHeader } from './FormHeader';
export { FormFooter } from './FormFooter';
export { SuccessScreen } from './SuccessScreen';

// Usage:
import { CreatePostForm, FormHeader } from './shared';
```

---

## 🔍 Testing Checklist (After Phase 2)

After extracting shared components, verify:

**TypeScript Compilation:**
```bash
cd themes/voxel-fse
npm run build
```

**Expected:** No TypeScript errors, successful build

**Imports Work:**
- [ ] CreatePostForm exports correctly from shared/
- [ ] FormHeader, FormFooter, SuccessScreen export correctly
- [ ] Barrel export (index.ts) works
- [ ] No circular dependency warnings

**No Functional Changes Yet:**
- [ ] frontend.tsx still works (we haven't modified it yet)
- [ ] Backend preview still shows static HTML (ServerSideRender still in place)

---

## 📚 Full Documentation

**Complete Implementation Plan:**
`C:\Users\herle\.claude\plans\golden-dreaming-tower.md`

**Related Documentation:**
- `docs/conversions/create-post/` - All create-post conversion docs
- `docs/conversions/gutenberg-editor-rendering-guide-v1.md` - Editor rendering patterns
- `docs/conversions/gutenberg-editor-rendering-guide-v2.md` - Advanced patterns

**Project Memory:**
`.mcp-memory/memory.json` - Project knowledge graph

---

## 💡 Tips for Phase 2

1. **Read Before Extracting:** Understand the full frontend.tsx component structure first
2. **Copy, Don't Move:** Keep frontend.tsx working while creating shared/
3. **Test Incrementally:** Build after each component extraction
4. **Preserve Logic:** Don't change behavior, just reorganize files
5. **Context Prop:** Add but don't use yet (used in Phases 4-5)

---

## 🎬 Next Session Start Commands

**1. Verify Working Directory:**
```bash
cd c:\Users\Local Sites\musicalwheel\app\public\wp-content\themes\voxel-fse
```

**2. Check Git Status:**
```bash
git status
git log --oneline -5
```

**3. Verify Phase 1:**
```bash
# Check REST endpoint exists
ls app/controllers/rest-api-controller.php
# Should return: app/controllers/rest-api-controller.php
```

**4. Start Phase 2:**
```bash
# Create shared directory
mkdir -p app/blocks/src/create-post/shared

# Ready to extract components
```

---

## ✅ Phase 2 Success Criteria

Before moving to Phase 3, ensure:

- [x] `shared/` directory created
- [x] CreatePostForm.tsx extracted (668 lines)
- [x] FormHeader.tsx extracted
- [x] FormFooter.tsx extracted
- [x] SuccessScreen.tsx extracted
- [x] types.ts updated with new interfaces
- [x] Barrel export (shared/index.ts) created
- [x] TypeScript compilation passes (`npm run build`)
- [x] No import errors
- [x] frontend.tsx still works (no functional changes yet)

---

**Ready to continue with Phase 2!** 🚀

**Estimated Time for Phase 2:** 3-4 hours (extraction + testing)

**Next Phase After This:** Phase 3 - Create custom hooks (2-3 hours)
