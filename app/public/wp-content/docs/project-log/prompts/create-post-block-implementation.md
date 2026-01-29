# Prompt: Create Post Block Implementation

**Task ID:** create-post-block-full
**Priority:** High - Essential Block
**Estimated Duration:** 15 days
**Status:** Ready to Start
**Date Created:** November 2025

---

## 🎯 Objective

Implement the **create-post** FSE block by converting Voxel's Elementor widget (5,125 lines) to a fully functional WordPress FSE block with full feature parity.

This is our most complex block and sets the pattern for all form-based blocks.

---

## 📋 Current Status

### What's Complete
- ✅ Build system configured (Vite + externals + import maps)
- ✅ Block_Loader auto-discovery working
- ✅ MVP structure exists at `themes/voxel-fse/app/blocks/src/create-post/`
  - block.json
  - index.tsx (basic registration)
  - edit.tsx (placeholder editor component)
  - save.tsx (returns null)
  - render.php (basic server-side render)

### What's NOT Done Yet
- ❌ Full Voxel widget analysis (Step 1)
- ❌ Widget controls mapping to block attributes
- ❌ Field type system implementation
- ❌ File upload functionality
- ❌ Form validation (client + server)
- ❌ AJAX submission handler
- ❌ Full editor component with InspectorControls
- ❌ Complete server-side rendering

---

## 📚 Required Reading

### Primary Source
**File:** `themes/voxel/app/widgets/create-post.php` (5,125 lines)
- This is THE source of truth
- Contains all widget controls, rendering logic, and functionality
- Must analyze completely before implementation

### Supporting Documentation
1. **Widget Discovery:**
   - `docs/voxel-discovery/phase2/01-widget-directories.md`
   - `docs/voxel-discovery/phase2/02-widget-files.md`
   - `docs/voxel-discovery/phase2/03-widgets-by-complexity.md`

2. **Voxel Architecture:**
   - `docs/voxel-discovery/` - Parent theme architecture analysis
   - `docs/voxel-documentation/` - 160+ Voxel feature specs

3. **Project Guidelines:**
   - `CLAUDE.md` - Project setup and architecture
   - `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md` - MUST READ FIRST
   - `docs/roadmap/02-phase-2-widget-to-block-conversion.md` - Phase 2 plan

4. **Existing Block Examples:**
   - `themes/voxel-fse/app/blocks/src/product-price/` - Simpler block example
   - `themes/voxel-fse/app/blocks/src/dynamic-text/` - Dynamic data example

---

## 🔍 Step 1: Read Widget & Create Progress Tracker (2-4 hours)

**Create-post is a COMPLEX block (5,125 lines) - requires lightweight progress tracker for multi-session continuity**

### 1.1 Read Voxel Widget (2-3 hours)
- Read entire `themes/voxel/app/widgets/create-post.php` file
- Identify all widget features as you read
- Note complex sections (file upload, validation, submission)

### 1.2 Create Progress Tracker (1 hour)
Create lightweight tracker at `docs/conversions/create-post-progress.md`:

```markdown
# Create Post Block - Progress Tracker

## Widget Features (from create-post.php)
- [ ] Text/textarea fields
- [ ] File upload (single/multiple)
- [ ] Category selector
- [ ] Tag input
- [ ] Form validation
- [ ] AJAX submission
- [ ] Success/error handling
- [ ] (add features as discovered)

## Implementation Status
- ✅ Basic block structure
- 🔄 Currently working on: [feature name]
- ⏳ Not started: [remaining features]

## Key Decisions & Notes
- File upload uses Voxel handler at line 2341
- Validation: client (React Hook Form) + server (PHP)
- Form submission: AJAX to custom REST endpoint
- (add notes as you work)

## Voxel Dependencies Found
- Field types: [list]
- APIs: [list]
- Template utilities: [list]
```

**That's it for documentation! Just maintain this tracker as you work.**

---

## 🏗️ Step 2: Block Structure Setup (Days 3-4)

### 2.1 Update block.json
Add all block attributes based on analysis:
```json
{
  "attributes": {
    "postType": {
      "type": "string",
      "default": "post"
    },
    "showCategories": {
      "type": "boolean",
      "default": true
    },
    "allowFileUpload": {
      "type": "boolean",
      "default": true
    },
    "maxFileSize": {
      "type": "number",
      "default": 5242880
    }
    // ... all other attributes
  }
}
```

### 2.2 TypeScript Interfaces
Create complete type definitions in `edit.tsx`:
```typescript
interface CreatePostAttributes {
  postType: string;
  showCategories: boolean;
  allowFileUpload: boolean;
  maxFileSize: number;
  // ... all attributes
}

interface EditProps {
  attributes: CreatePostAttributes;
  setAttributes: (attrs: Partial<CreatePostAttributes>) => void;
  clientId: string;
}
```

### 2.3 File Structure
Organize additional files if needed:
```
app/blocks/src/create-post/
├── block.json
├── index.tsx
├── edit.tsx
├── save.tsx
├── render.php
├── components/          # Editor UI components
│   ├── FieldConfigurator.tsx
│   ├── FileUploadSettings.tsx
│   └── FormPreview.tsx
├── utils/               # Helper functions
│   ├── validation.ts
│   └── fieldTypes.ts
└── styles/
    ├── editor.css
    └── style.css
```

---

## 💻 Step 3: Editor Component (Days 5-8)

### 3.1 InspectorControls (Days 5-6)
Build settings sidebar with all controls from Voxel widget:

**Panel Groups:**
1. **General Settings**
   - Post type selector
   - Form title
   - Submit button text
   - Success message

2. **Field Configuration**
   - Available fields list
   - Field visibility toggles
   - Field order (drag & drop?)
   - Required field markers

3. **File Upload Settings**
   - Enable/disable upload
   - Max file size
   - Allowed file types
   - Multiple files toggle

4. **Validation Settings**
   - Required field rules
   - Custom validation messages
   - Character limits

5. **Submission Settings**
   - Post status after submit
   - Author assignment
   - Redirect URL after success
   - Email notifications

### 3.2 Editor Preview (Days 7-8)
Build accurate form preview in editor:
- Show configured fields
- Display file upload areas
- Preview submit button
- Show validation hints
- Match frontend styling

**Requirements:**
- Must show FULL functionality in editor
- Interactive preview where possible
- Accurate representation of frontend
- Real-time updates when settings change

---

## 🎨 Step 4: Field Rendering System (Days 9-12)

### 4.1 Field Type Components
Implement all Voxel field types used in create-post:

**Basic Fields:**
- Text field
- Textarea field
- Number field
- Email field
- URL field
- Date picker

**Selection Fields:**
- Select dropdown
- Radio buttons
- Checkboxes
- Category selector
- Tag input

**Advanced Fields:**
- File upload (single/multiple)
- Image upload with preview
- Location field with map
- Repeater fields (nested)
- Relation fields (connect posts)
- Work hours fields

### 4.2 Field Validation
Client-side validation for each field type:
- Required field checks
- Format validation (email, URL, etc.)
- Character limits
- File size/type validation
- Custom validation rules

### 4.3 Integration with Voxel
- Use Voxel's field rendering where possible
- Access Voxel field definitions
- Store data in Voxel's meta structure
- Respect Voxel field configurations

---

## 📤 Step 5: Form Submission (Days 13-14)

### 5.1 Frontend Form Handler
JavaScript submission logic:
- Prevent default form submit
- Gather all field values
- Validate before submission
- Show loading state
- Handle file uploads with progress
- AJAX submission to WordPress

### 5.2 Server-Side Endpoint
Create REST API endpoint:
```php
// In render.php or separate controller
register_rest_route('voxel-fse/v1', '/create-post', [
    'methods' => 'POST',
    'callback' => 'handle_post_creation',
    'permission_callback' => 'check_create_permission'
]);
```

### 5.3 Post Creation Logic
- Validate all fields server-side
- Process file uploads
- Create WordPress post
- Save custom fields via Voxel
- Assign categories/tags
- Set post status
- Send notifications (if configured)
- Return success/error response

### 5.4 Error Handling
- Field-level error display
- Form-level error messages
- Network error handling
- User-friendly error messages
- Validation error highlighting

---

## 🧪 Step 6: Testing & Polish (Day 15)

### 6.1 Functional Testing
- Test all field types
- Test file uploads (single/multiple)
- Test validation (client + server)
- Test with different post types
- Test error scenarios
- Test success flow

### 6.2 Integration Testing
- Verify Voxel integration
- Test with Voxel custom fields
- Verify post creation in Voxel admin
- Test permissions/capabilities
- Test with different user roles

### 6.3 Editor Experience
- Test block in WordPress editor
- Verify InspectorControls work
- Check editor preview accuracy
- Test responsive design
- Verify accessibility

### 6.4 Final Documentation (Optional)
- Update progress tracker with final notes
- Optional: Create `docs/blocks/create-post.md` if block needs end-user guide
- Inline code comments for complex logic
- TypeScript JSDoc comments for non-obvious functions

---

## 🚧 Technical Challenges & Solutions

### Challenge 1: File Upload Complexity
**Problem:** Handle multipart/form-data, progress tracking, error handling
**Solution:**
- Use WordPress media uploader APIs
- Integrate with Voxel's file handling system
- Show upload progress with React state
- Handle errors gracefully with retry option

### Challenge 2: Field Type Variety
**Problem:** 11+ field types with different rendering/validation
**Solution:**
- Create field type factory pattern
- Reuse Voxel field rendering where possible
- Component composition for complex fields
- Shared validation utilities

### Challenge 3: State Management
**Problem:** Complex form state across multiple fields
**Solution:**
- React Hook Form for form state
- Controlled components for file uploads
- Context API if state becomes too complex
- Separate concerns (UI state vs form data)

### Challenge 4: Server-Side Rendering
**Problem:** Dynamic form must render on server
**Solution:**
- PHP renders form structure
- React enhances in editor
- Use Voxel template utilities
- Server-side validation mirrors client

---

## ✅ Success Criteria

**Step 1 Complete When:**
- [ ] Read entire create-post widget (5,125 lines)
- [ ] Created lightweight progress tracker
- [ ] Listed all features found in widget
- [ ] Ready to start coding

**Implementation Complete When:**
- [ ] All field types render correctly
- [ ] File upload works (single + multiple)
- [ ] Client-side validation works
- [ ] Server-side validation works
- [ ] Form submits and creates posts
- [ ] Posts appear in Voxel admin correctly
- [ ] Block shows full preview in editor
- [ ] InspectorControls has all settings
- [ ] Error handling is comprehensive
- [ ] Code is TypeScript strict mode compliant
- [ ] Progress tracker updated with final status

**Testing Complete When:**
- [ ] All field types tested
- [ ] File upload tested with various file types/sizes
- [ ] Validation tested (valid + invalid inputs)
- [ ] Different post types tested
- [ ] Different user roles tested
- [ ] Error scenarios tested
- [ ] Edge cases handled
- [ ] Performance is acceptable

---

## 📝 Important Constraints

### DO:
✅ Match Voxel functionality exactly (1:1 feature parity)
✅ Use Voxel's existing APIs and systems
✅ Store data in Voxel's meta structure
✅ Respect Voxel's permission system
✅ Follow WordPress coding standards
✅ Use TypeScript strict mode
✅ Provide full editor preview
✅ Maintain progress tracker (complex blocks only)
✅ Write inline comments for complex logic

### DON'T:
❌ Modify Voxel parent theme files
❌ Reimplementing what Voxel already does
❌ Skip server-side validation
❌ Ignore accessibility
❌ Hardcode values that should be configurable
❌ Leave TODO comments in production code
❌ Skip error handling

---

## 🔮 Phase 4 Headless Consideration

**Current Phase (Phase 2):** Build WordPress FSE blocks normally

**Future Phase (Phase 4):** Next.js headless frontend on Vercel will fetch data via **WPGraphQL**, not REST API

### GraphQL Architecture (Future)

**Installed Plugins:**
- `wp-graphql` - Core GraphQL API
- `wp-graphql-content-blocks` - Exposes Gutenberg blocks via GraphQL
- `wp-graphql-jwt-authentication` - Auth for mutations
- `wpgraphql-smart-cache` - ISR cache invalidation webhooks
- `faustwp` - Faust.js framework for headless WordPress

**How It Works:**
```
WordPress (Admin):
└─> User creates page with blocks
└─> Blocks store: type, attributes, content
└─> wp-graphql-content-blocks exposes blocks via GraphQL

Next.js (Frontend - Vercel):
└─> Fetches page via GraphQL query
└─> Maps block types to Next.js components (separate components)
└─> Renders same HTML/CSS as WordPress blocks
└─> ISR rebuilds when WordPress triggers webhook
```

**What This Means for Block Development:**

✅ **DO (Phase 2):**
- Store all block data in standard WordPress way
- Use block attributes (exposed automatically via GraphQL)
- Store custom fields properly (accessible via GraphQL)
- Register block in block.json (wp-graphql-content-blocks reads this)

❌ **DON'T:**
- Try to share React components between WordPress and Next.js (won't work)
- Worry about GraphQL implementation now (handled by plugin)
- Try to make blocks "portable" (they're WordPress-specific)

📝 **Optional Tracking:**
If you discover complex data needs, note what GraphQL queries Phase 4 would need:
```markdown
# create-post Block - Future GraphQL Queries Needed
- Post type configurations
- Field definitions
- Validation rules
```

**Bottom Line:** Build WordPress blocks normally. The GraphQL plugin will handle exposing the data. Phase 4 will build separate Next.js components that fetch via GraphQL and render the same output.

---

## 🎨 CSS Architecture: Tailwind vs Voxel CSS

**TL;DR:** Use Voxel CSS classes for matching widgets, Tailwind for editor UI only

### The CSS Challenge

Voxel has an extensive CSS system with specific classes for forms, fields, buttons, etc. We need perfect visual parity.

### ✅ Correct Approach:

**Editor UI (InspectorControls, Settings Panels):**
```typescript
// edit.tsx - Editor components can use Tailwind
<InspectorControls>
  <PanelBody className="space-y-4"> {/* Tailwind */}
    <div className="flex items-center gap-2"> {/* Tailwind */}
      <TextControl label="Field Name" />
    </div>
  </PanelBody>
</InspectorControls>
```

**Frontend Output (What users see):**
```typescript
// frontend.tsx or render.php - MUST use Voxel CSS classes
<form className="ts-form ts-booking-form"> {/* Voxel CSS */}
  <div className="ts-form-group"> {/* Voxel CSS */}
    <input className="ts-input-text" /> {/* Voxel CSS */}
  </div>
  <button className="ts-btn ts-btn-2"> {/* Voxel CSS */}
    Submit
  </button>
</form>
```

### Why This Matters:

**Voxel CSS Classes** (used by widgets):
```css
/* From Voxel theme */
.ts-form { /* Specific Voxel form styling */ }
.ts-form-group { /* Voxel field wrapper */ }
.ts-input-text { /* Voxel input styling */ }
.ts-btn { /* Voxel button base */ }
.ts-btn-2 { /* Voxel button variant */ }
```

**If you use Tailwind instead:**
```html
<!-- ❌ WRONG - Won't match Voxel -->
<form className="flex flex-col gap-4">
  <input className="border rounded px-4 py-2" />
</form>
```

### Implementation Strategy:

**1. Study Voxel Widget HTML First:**
```php
// Read themes/voxel/app/widgets/create-post.php
// Find the HTML structure and CSS classes Voxel uses
// Example from Voxel:
<div class="ts-form ts-booking-form">
  <div class="ts-form-group">
    <label class="ts-form-label">...</label>
    <input class="ts-input-text" />
  </div>
</div>
```

**2. Match Exactly in Your Block:**
```typescript
// frontend.tsx - Match Voxel structure
<div className="ts-form ts-booking-form">
  <div className="ts-form-group">
    <label className="ts-form-label">{label}</label>
    <input className="ts-input-text" value={value} onChange={...} />
  </div>
</div>
```

**3. Voxel CSS is Already Loaded:**
- Voxel parent theme loads all CSS
- Your blocks automatically inherit Voxel styles
- Just use the same class names

### When Can You Use Tailwind?

✅ **YES - Editor components:**
- InspectorControls layouts
- Custom settings panels
- Editor-specific UI elements

❌ **NO - Frontend matching:**
- Forms that need to match Voxel
- Buttons/fields matching Voxel styles
- Any UI that exists in Voxel widgets

⚠️ **MAYBE - New custom features:**
- UI elements that don't exist in Voxel
- Custom additions beyond Voxel features
- But keep consistent with Voxel design system

### React Components Architecture:

```typescript
// Edit component (editor) - Tailwind OK
export default function Edit({ attributes, setAttributes }) {
  return (
    <>
      <InspectorControls>
        <PanelBody className="space-y-4"> {/* Tailwind */}
          {/* Editor settings */}
        </PanelBody>
      </InspectorControls>

      <div {...useBlockProps()}>
        {/* Preview - should match frontend, use Voxel CSS */}
        <FormPreview attributes={attributes} />
      </div>
    </>
  );
}

// Frontend component - Voxel CSS only
export function CreatePostForm({ attributes }) {
  return (
    <form className="ts-form ts-booking-form"> {/* Voxel */}
      <div className="ts-form-group"> {/* Voxel */}
        <input className="ts-input-text" /> {/* Voxel */}
      </div>
    </form>
  );
}
```

### Finding Voxel CSS Classes:

**Method 1: Read Widget PHP**
```php
// themes/voxel/app/widgets/create-post.php
// Look for HTML output with class names
```

**Method 2: Inspect Frontend**
- Load Voxel demo site
- Inspect element to see CSS classes
- Use browser DevTools

**Method 3: Check Voxel CSS Files**
```
themes/voxel/assets/css/
└── Look for form/button styles
```

### Summary:

| Component | CSS to Use | Reason |
|-----------|------------|--------|
| Editor UI (InspectorControls) | Tailwind ✅ | Editor-only, doesn't need Voxel match |
| Editor Preview | Voxel CSS ✅ | Should match frontend |
| Frontend Output | Voxel CSS ✅ | MUST match Voxel exactly |
| New Custom UI | Tailwind ⚠️ | Only if no Voxel equivalent |

**Golden Rule:** If Voxel has it, use Voxel's CSS classes. If it's editor-only UI, Tailwind is fine.

---

## ⚛️ React Architecture: Editor vs Frontend

**TL;DR:** Complex interactive blocks need React on BOTH editor AND frontend

### Why React on Frontend for ALL Blocks?

**React on frontend is recommended for ALL blocks because:**

✅ **Consistency** - Same patterns across all blocks
✅ **Maintainability** - One approach, easier to maintain
✅ **Phase 4 Ready** - Easier to port to Next.js headless
✅ **Better DX** - React is easier than vanilla JS
✅ **Already in build** - React is already available
✅ **State management** - Even simple blocks benefit

**Vanilla JS = Technical debt that will hurt in Phase 4**

### create-post is HIGHLY Interactive:

This block requires:
- Multi-step form navigation
- File uploads with progress bars
- Real-time validation feedback
- Dynamic field visibility (conditional logic)
- Complex state management
- Field dependencies and repeater fields

**Vanilla JS for this = maintenance nightmare**

### Correct Architecture:

**1. Editor Component (edit.tsx):**
```typescript
// WordPress Gutenberg editor
// Uses WordPress hooks: useBlockProps, InspectorControls
// Configuration UI only
export default function Edit({ attributes, setAttributes }) {
  return (
    <>
      <InspectorControls>
        {/* Block settings */}
      </InspectorControls>
      <div {...useBlockProps()}>
        {/* Preview - should match frontend */}
      </div>
    </>
  );
}
```

**2. Frontend Component (frontend.tsx - SEPARATE file):**
```typescript
// Public-facing React component
// Handles all form interactivity
// NO WordPress editor dependencies
import { createRoot } from '@wordpress/element';

export const CreatePostForm = ({ attributes }) => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form logic
  const handleSubmit = async () => {
    // AJAX submission to WordPress REST API
  };

  return (
    <form className="ts-form ts-booking-form"> {/* Voxel CSS */}
      {/* Multi-step form UI */}
      {/* File upload with progress */}
      {/* Validation errors */}
    </form>
  );
};

// Mount on frontend
const container = document.getElementById('create-post-form');
if (container) {
  const root = createRoot(container);
  const attributes = JSON.parse(container.dataset.attributes);
  root.render(<CreatePostForm attributes={attributes} />);
}
```

**3. Server-Side Rendering (render.php):**
```php
<?php
function render_create_post_block($attributes, $content, $block) {
    // Enqueue frontend React component
    wp_enqueue_script(
        'create-post-frontend',
        get_stylesheet_directory_uri() . '/build/create-post-frontend.js',
        ['wp-element'], // React from WordPress
        VOXEL_FSE_VERSION,
        true
    );

    // Pass data to React
    wp_localize_script('create-post-frontend', 'createPostData', [
        'restUrl' => rest_url('voxel-fse/v1/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'postTypes' => get_post_types(['public' => true]),
    ]);

    // Output container for React to mount
    return sprintf(
        '<div id="create-post-form" class="voxel-fse-create-post" data-attributes="%s"></div>',
        esc_attr(wp_json_encode($attributes))
    );
}
```

### Build Configuration:

You'll need TWO separate builds:

**Editor build** (already configured in vite.blocks.config.js):
- Input: `index.tsx` (registers block + editor component)
- Output: `build/create-post/index.js`
- Loaded: WordPress editor only

**Frontend build** (need to add):
- Input: `frontend.tsx` (interactive form component)
- Output: `build/create-post-frontend.js`
- Loaded: Public-facing pages only
- Enqueued in render.php

### Benefits for Phase 4:

Having React on frontend actually helps Phase 4 headless:
- Similar component patterns as Next.js
- Easier to port state management logic
- Form handling logic transfers
- Just different data fetching layer

### File Structure:

```
app/blocks/src/create-post/
├── block.json              # Block metadata
├── index.tsx               # Block registration + editor
├── edit.tsx                # Editor component (InspectorControls)
├── frontend.tsx            # PUBLIC-FACING React component
├── save.tsx                # Returns null (dynamic block)
├── render.php              # Enqueues frontend.tsx + outputs container
├── components/             # Shared between editor/frontend
│   ├── FieldRenderer.tsx
│   ├── FileUpload.tsx
│   └── FormStep.tsx
└── styles/
    ├── editor.css          # Editor-only styles
    └── style.css           # Frontend styles
```

### Summary:

| Block Type | Frontend Approach | Reason |
|-----------|-------------------|--------|
| **ALL blocks (simple, medium, complex)** | **React component** | Consistency, Phase 4 portability, maintainability |
| create-post | React component | Complex state, multi-step form, file uploads |
| Simple blocks (image, tabs) | React component | Keep patterns consistent, Phase 4 ready |
| Medium blocks (countdown, charts) | React component | State management, easier than vanilla JS |

**Vanilla JS = Technical debt that makes Phase 4 headless migration harder**

**For create-post:** Use React on frontend in a separate `frontend.tsx` component, enqueued via `render.php`.

---

## 🔗 Key Files Reference

### Voxel Source
- `themes/voxel/app/widgets/create-post.php` - Main widget file
- `themes/voxel/app/post-types/` - Post type system
- `themes/voxel/app/post-types/fields/` - Field types
- `themes/voxel/templates/widgets/create-post.php` - Widget template (if exists)

### Child Theme Files
- `themes/voxel-fse/app/blocks/src/create-post/` - Block source
- `themes/voxel-fse/app/blocks/Block_Loader.php` - Auto-discovery
- `themes/voxel-fse/vite.blocks.config.js` - Build config
- `themes/voxel-fse/functions.php` - Theme init

### Documentation
- `CLAUDE.md` - Project guide
- `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md` - Critical rules
- `docs/roadmap/02-phase-2-widget-to-block-conversion.md` - Roadmap

---

## 🎬 Getting Started

**First Steps:**
1. Read `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`
2. Read `themes/voxel/app/widgets/create-post.php` completely (5,125 lines)
3. Create lightweight progress tracker at `docs/conversions/create-post-progress.md`
4. List features found while reading
5. Start coding immediately - no formal analysis needed

**Development Workflow:**
```bash
# Start development server
cd themes/voxel-fse
npm run build:blocks -- --watch

# In another terminal, watch for PHP changes
# WordPress will auto-reload blocks on save
```

**Testing:**
1. Open WordPress admin
2. Edit a post/page
3. Insert "Create Post (VX)" block from Voxel FSE category
4. Configure block settings
5. Preview in editor
6. Save and view on frontend
7. Test form submission

---

## 📊 Progress Tracking

Use TodoWrite tool to track:
- [ ] Step 1: Analysis (Days 1-2)
- [ ] Step 2: Block Structure (Days 3-4)
- [ ] Step 3: Editor Component (Days 5-8)
- [ ] Step 4: Field Rendering (Days 9-12)
- [ ] Step 5: Form Submission (Days 13-14)
- [ ] Step 6: Testing & Polish (Day 15)

Update roadmap (`docs/roadmap/02-phase-2-widget-to-block-conversion.md`) as you progress.

---

**Ready to start? Begin with Step 1: Analysis by reading the Voxel widget file completely.**
