# Phase D: Popup Integration - Startup Prompt

**Date:** 2025-11-30
**Status:** Ready to Start
**Prerequisites:** Phase C Complete (form submission working)
**Goal:** Create Post form opens in Voxel-style popup modal

---
 
 

## 📋 Phase D Has Two Separate Tracks

### Track 1: Popup Modal Integration (THIS PHASE)
**Goal:** Create Post form opens in popup modal
**Estimated Effort:** Medium (2-3 days)
**Priority:** High (recommended by Phase C handoff)

### Track 2: Field Popup Fixes (FUTURE)
**Goal:** Fix broken popup UI in DateField, TimezoneField, etc.
**Estimated Effort:** Large (5-7 days)
**Priority:** Medium (blocks 9 advanced fields)

**This prompt focuses on Track 1: Popup Modal Integration**

---

## ✅ Prerequisites - What's Already Done

### Phase C Completion Status

**Form Submission:** ✅ WORKING
- ✅ Create new posts via AJAX
- ✅ Edit existing posts
- ✅ Validation (client-side and server-side)
- ✅ Multi-step navigation
- ✅ Draft saving
- ✅ Success/error handling
- ✅ Admin metabox integration

**Field Components:** ✅ PRODUCTION-READY
- ✅ 5 fields at Level 2 (TextField, TimeField, LocationField, MultiselectField, UIField)
- ✅ ~13 basic fields working
- ✅ 7 fields documented for future Phase D (popup-kit)

**Create Post Block Structure:**
```
themes/voxel-fse/app/blocks/src/create-post/
├── editor/
│   └── Edit.tsx           # Gutenberg editor component
├── frontend/
│   └── index.tsx          # Frontend + Admin metabox
├── components/
│   ├── CreatePostForm.tsx # Main form component
│   ├── FormHeader.tsx
│   ├── FormFooter.tsx
│   └── fields/            # 25+ field components
├── hooks/
│   ├── useFormSubmission.ts
│   └── useFieldValidation.ts
└── render.php             # Server-side rendering with context detection
```

**Popup-Kit Block:** ✅ EXISTS
- Block already created in previous work
- Located at: `themes/voxel-fse/app/blocks/src/popup-kit/`
- Needs integration with create-post

---

## 🎯 Phase D Requirements

### 1. Trigger Button/Link

**Requirement:** Button or link that opens popup with create-post form

**Voxel Pattern:**
```html
<a href="#" data-voxel-popup="create-post">Create Post</a>
```

**Our Implementation:**
- Use `data-voxel-popup` attribute
- JavaScript listener detects clicks
- Opens popup modal with create-post form inside

---

### 2. Popup Modal Opens

**Requirement:** Modal overlay appears with create-post form

**Voxel Pattern:**
- Full-screen overlay (dark background)
- Centered modal container
- Close button (X in top-right)
- Click outside to close (optional)
- ESC key to close

**Our Implementation:**
- Use existing popup-kit block
- Render create-post form inside popup
- Match Voxel's exact popup styles

---

### 3. Form Submits via AJAX

**Requirement:** Form submission works within modal context

**Current Status:**
- ✅ AJAX submission already works (Phase C)
- ✅ useFormSubmission hook handles submission
- ✅ Success/error handling in place

**Phase D Addition:**
- Ensure submission works when form is in popup
- Handle success within popup context
- Don't close popup on validation errors

---

### 4. Success Message in Modal

**Requirement:** After successful submission, show success message in modal

**Options:**

**Option A:** Replace form with success screen (current behavior)
```
Form → Submit → Success Screen (View/Edit buttons)
```

**Option B:** Show success message, keep modal open
```
Form → Submit → Success Toast → Form Reset
```

**Option C:** Close popup, navigate to post
```
Form → Submit → Close Popup → Redirect to Post
```

**Recommended:** Option A (matches current create-post behavior)

---

### 5. Modal Close/Navigate

**Requirement:** After success, user can close modal or view/edit post

**Actions:**
- **View Post:** Navigate to post permalink (close modal)
- **Edit Post:** Navigate to edit screen (close modal)
- **Close (X):** Close modal, stay on current page
- **ESC key:** Close modal

---

## 🔍 Discovery Phase - BEFORE Implementation

**⚠️ CRITICAL:** Follow discovery-first methodology per `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`

### Step 1: Understand Voxel's Popup System

**Tasks:**
1. Read Voxel's popup-kit widget code
2. Find popup-kit template files
3. Understand popup initialization
4. Document popup event system

**Search Targets:**
```bash
# Find popup-kit widget
themes/voxel/widgets/*popup*

# Find popup templates
themes/voxel/templates/widgets/*popup*

# Find JavaScript popup handlers
themes/voxel/assets/js/*popup*
```

**Document:**
- How popups are triggered (data attributes, JavaScript)
- Popup HTML structure
- Popup open/close lifecycle
- State management (open/closed)
- Integration with forms

---

### Step 2: Review Existing popup-kit Block

**Location:** `themes/voxel-fse/app/blocks/src/popup-kit/`

**Tasks:**
1. Read popup-kit block code
2. Understand current implementation
3. Check what's working vs what's missing
4. Review block attributes/settings

**Questions to Answer:**
- Does popup-kit block already work?
- What features are implemented?
- What features are missing?
- Can we render create-post inside it?

---

### Step 3: Plan Integration Approach

**After discovery, decide on approach:**

**Option A:** Use existing popup-kit block
- Render create-post block inside popup-kit
- Configure popup-kit to trigger on button click
- Handle success/close events

**Option B:** Create popup wrapper component
- New React component wraps CreatePostForm
- Manages popup state (open/closed)
- Renders in portal (like Voxel)

**Option C:** Extend create-post block
- Add "Open in Popup" setting to create-post block
- Block renders trigger button + popup modal
- Self-contained solution

**Recommendation:** Choose after discovery (likely Option A)

---

## 📐 Implementation Plan (After Discovery)

### Phase 1: Basic Popup Integration (1 day)

**Tasks:**
1. Configure popup-kit block to contain create-post form
2. Add trigger button with `data-voxel-popup` attribute
3. Test popup open/close
4. Verify form renders correctly in popup

**Acceptance Criteria:**
- ✅ Button click opens popup
- ✅ Create-post form visible in popup
- ✅ Close button (X) closes popup
- ✅ ESC key closes popup
- ✅ Click outside closes popup

---

### Phase 2: Form Submission in Popup (0.5 days)

**Tasks:**
1. Test form submission from within popup
2. Handle validation errors (keep popup open)
3. Handle success (show success screen)

**Acceptance Criteria:**
- ✅ Form submits via AJAX from popup
- ✅ Validation errors display in popup (doesn't close)
- ✅ Success screen shows in popup
- ✅ View/Edit buttons work from popup

---

### Phase 3: Success Handling & Navigation (0.5 days)

**Tasks:**
1. Implement View Post button (close popup, navigate)
2. Implement Edit Post button (close popup, navigate)
3. Test navigation flow

**Acceptance Criteria:**
- ✅ View Post closes popup and navigates to post
- ✅ Edit Post closes popup and navigates to edit screen
- ✅ Success message displays before navigation (optional)

---

### Phase 4: Polish & Edge Cases (0.5-1 day)

**Tasks:**
1. Test multi-step forms in popup
2. Test draft saving from popup
3. Test file uploads from popup
4. Add loading states
5. Match Voxel's exact styling
6. Cross-browser testing

**Acceptance Criteria:**
- ✅ Multi-step navigation works in popup
- ✅ Draft save works from popup
- ✅ File uploads work from popup
- ✅ Loading states match Voxel
- ✅ Styling 1:1 match with Voxel
- ✅ Works in Chrome, Firefox, Safari, Edge

---

## 🧪 Testing Checklist

### Basic Functionality

- [ ] Trigger button opens popup
- [ ] Create-post form renders in popup
- [ ] All field types display correctly
- [ ] Form validation works
- [ ] Submit creates new post
- [ ] Success screen displays
- [ ] View Post button works
- [ ] Edit Post button works
- [ ] Close (X) button closes popup
- [ ] ESC key closes popup
- [ ] Click outside closes popup (if enabled)

### Multi-Step Forms

- [ ] Next/Previous buttons work
- [ ] Step validation prevents navigation
- [ ] URL step parameter updates
- [ ] Browser back/forward works
- [ ] Step progress bar displays

### Draft Saving

- [ ] Draft save button works
- [ ] Draft creates post with 'draft' status
- [ ] Edit mode loads draft data
- [ ] Draft button shows loading state

### File Uploads

- [ ] File upload UI works in popup
- [ ] Files can be selected
- [ ] Preview displays correctly
- [ ] File removal works
- [ ] Multiple files work (if applicable)

### Edge Cases

- [ ] Very long forms scroll correctly
- [ ] Small screens (mobile) work
- [ ] Required fields prevent submission
- [ ] Server errors display correctly
- [ ] Network errors handled gracefully
- [ ] Multiple popups don't conflict

---

## 📁 Key Files to Review/Modify

### Existing Files (Read First)

1. **Voxel popup-kit widget**
   - `themes/voxel/widgets/popup-kit.php`
   - Understand Voxel's popup implementation

2. **Voxel popup templates**
   - `themes/voxel/templates/widgets/popup-kit.php`
   - HTML structure to match

3. **Our popup-kit block**
   - `themes/voxel-fse/app/blocks/src/popup-kit/` ✅ **VERIFIED PATH**
   - Current implementation status

4. **Create-post form component**
   - `themes/voxel-fse/app/blocks/src/create-post/components/CreatePostForm.tsx`
   - May need popup context awareness

5. **Form submission hook**
   - `themes/voxel-fse/app/blocks/src/create-post/hooks/useFormSubmission.ts`
   - May need popup success handling

### Files to Create/Modify

**TBD after discovery** - Don't create files before understanding Voxel's system

Potential files:
- Popup trigger component
- Popup state management
- Integration between popup-kit and create-post
- Success handler for popup context

---

## 🎓 Key Principles

### 1. Discovery First ⚠️

**NEVER implement before discovery:**
- Read Voxel's popup-kit widget code FIRST
- Understand how Voxel triggers popups
- Document popup lifecycle
- Plan approach based on evidence

**DO NOT:**
- Assume popup implementation
- Guess at popup structure
- Start coding without reading Voxel
- Copy patterns from other projects

---

### 2. 1:1 Voxel Matching

**Match Voxel exactly:**
- HTML structure (classes, data attributes)
- CSS styling (overlay, modal, animations)
- JavaScript behavior (open/close, events)
- User experience (keyboard, mouse interactions)

**Reference:**
- Voxel popup-kit widget code
- Voxel popup templates
- Voxel CSS classes
- Voxel JavaScript event handlers

---

### 3. Incremental Implementation

**Build in phases:**
1. Basic popup (open/close)
2. Form rendering
3. Form submission
4. Success handling
5. Polish

**Test after each phase:**
- Don't build everything at once
- Verify each phase works before next
- Fix issues immediately
- Document discoveries

---

### 4. Reuse Existing Code

**Don't reinvent:**
- Use existing popup-kit block (if it works)
- Reuse CreatePostForm component (no changes needed)
- Leverage useFormSubmission hook (already works)
- Keep field components unchanged

**Only create new code when:**
- Popup trigger mechanism
- Popup state management
- Success handling for popup context
- Integration glue code

---

## 📚 Documentation to Reference

### Must Read BEFORE Starting

1. **AI Agent Critical Instructions**
   - `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`
   - Discovery-first methodology
   - 1:1 Voxel matching requirements

2. **Phase C Completion Summary**
   - `docs/project-log/tasks/task-2025-11-30-phase-c-field-enhancements-completion.md`
   - Current field status
   - What's already working

3. **Phase C Handoff**
   - `docs/project-log/prompts/prompt-2025-11-27-phase-c-form-submission-UPDATED.md`
   - Form submission implementation
   - Known limitations

### Reference During Implementation

1. **Create Post Block Structure**
   - `themes/voxel-fse/app/blocks/src/create-post/`
   - Understand existing code

2. **Voxel Popup Widget**
   - `themes/voxel/widgets/popup-kit.php`
   - Reference implementation

3. **Voxel Templates**
   - `themes/voxel/templates/widgets/popup-kit.php`
   - HTML structure

---

## 🚀 Getting Started

### Step 1: Read This Entire Prompt (15 minutes)

**Understand:**
- Phase D goals
- What's already done (Phase C)
- Discovery requirements
- Implementation plan
- Testing checklist

### Step 2: Discovery Phase (2-4 hours)

**Tasks:**
1. Read Voxel's popup-kit widget
2. Review our popup-kit block
3. Understand popup lifecycle
4. Document findings
5. Choose implementation approach

**Deliverable:**
- Discovery document with findings
- Implementation approach decision
- Architecture diagram (if needed)

### Step 3: Implementation Phase 1 (4-6 hours)

**Tasks:**
1. Implement basic popup integration
2. Add trigger button
3. Test open/close
4. Verify form renders

**Deliverable:**
- Working popup with create-post form
- No submission yet (just display)

### Step 4: Implementation Phases 2-4 (4-8 hours)

**Tasks:**
1. Form submission in popup
2. Success handling
3. Navigation
4. Polish

**Deliverable:**
- Complete popup integration
- All tests passing
- Documentation updated

---

## 📊 Success Criteria

### Phase D Complete When:

- ✅ Trigger button opens popup with create-post form
- ✅ Form renders correctly in popup (all field types)
- ✅ Form submits via AJAX from popup
- ✅ Validation errors display in popup (popup stays open)
- ✅ Success screen shows in popup after submission
- ✅ View/Edit buttons work from popup
- ✅ Close (X) button closes popup
- ✅ ESC key closes popup
- ✅ Multi-step forms work in popup
- ✅ Draft saving works from popup
- ✅ File uploads work from popup
- ✅ Styling matches Voxel 1:1
- ✅ No errors or warnings
- ✅ Cross-browser compatible
- ✅ Mobile responsive

---

## ⚠️ Known Challenges & Solutions

### Challenge 1: Popup State Management

**Issue:** Managing popup open/closed state

**Solution:**
- Use React state or context
- Store popup ID in state
- Trigger open/close via events
- Match Voxel's state pattern

### Challenge 2: Form in Modal Context

**Issue:** Form may behave differently in modal

**Solution:**
- Test all form features in modal
- Verify scroll behavior
- Check z-index stacking
- Test keyboard navigation

### Challenge 3: Success Navigation

**Issue:** Navigating after success while in popup

**Solution:**
- Close popup THEN navigate
- Or show success briefly, then navigate
- Use window.location for navigation
- Match Voxel's behavior exactly

### Challenge 4: File Uploads in Popup

**Issue:** File upload UI may be affected by modal

**Solution:**
- Test file selection in modal
- Verify drag-drop works
- Check preview display
- Test multiple files

---

## 📝 Deliverables

### 1. Discovery Document

**Required:**
- Voxel popup-kit analysis
- Our popup-kit block status
- Integration approach decision
- Architecture notes

**Location:** `docs/voxel-discovery/popup-kit-integration-discovery.md`

### 2. Implementation Code

**Required:**
- Popup trigger mechanism
- Popup integration code
- Success handling for popup context
- Tests (if applicable)

**Location:** `themes/voxel-fse/app/blocks/src/` (TBD based on approach)

### 3. Completion Summary

**Required:**
- What was implemented
- How it works
- Testing results
- Known limitations
- Future improvements

**Location:** `docs/project-log/tasks/task-2025-11-30-phase-d-popup-integration-completion.md`

---

## 🔄 Next Steps After Phase D

### Option 1: Phase D Track 2 - Field Popup Fixes

**Fix broken popup UI:**
- DateField (tiny popup → full-screen)
- TimezoneField (tiny popup → full-screen)
- Implement proper popup-kit for advanced fields

**Estimated Effort:** 5-7 days

---

### Option 2: Continue Phase 2 - Next Widget Conversion

**Convert next Voxel widget:**
- product-price (172 lines) - Simple display block
- image (15 lines) - Simplest widget
- print-template (50 lines) - Simple utility block

**Estimated Effort:** 1-3 days per widget

---

### Option 3: Level 2 Field Enhancements

**Enhance remaining basic fields:**
- NumberField, EmailField, UrlField, PhoneField
- ColorField, TextareaField, DescriptionField

**Estimated Effort:** 1-2 days total

---

## 🎯 Final Reminders

1. **⚠️ Discovery first** - Read Voxel's code before implementing
2. **1:1 matching** - Match Voxel's HTML, CSS, and behavior exactly
3. **Evidence-based** - Provide file paths and line numbers for all claims
4. **Test thoroughly** - Use the testing checklist
5. **Document everything** - Update docs as you go
6. **Ask questions** - If unsure, ask before implementing

---

**Ready to start Phase D?**

**Next Action:** Begin discovery by reading Voxel's popup-kit widget code

**Command:**
```bash
# Find popup-kit widget
find themes/voxel -name "*popup*" -type f
```

**Good luck! 🚀**

---

**End of Phase D Startup Prompt**
