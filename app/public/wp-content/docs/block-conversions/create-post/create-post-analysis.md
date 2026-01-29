# Create Post Block - Conversion Analysis

**Source:** `themes/voxel/app/widgets/create-post.php` (5,125 lines)
**Target:** FSE Block at `themes/voxel-fse/app/blocks/src/create-post/`
**Date:** November 2025
**Status:** Step 1 - Analysis Phase

---

## Executive Summary

The Create Post widget is Voxel's most complex form widget handling post creation/editing with:
- **Dynamic field system** from post type configurations
- **Multi-step form navigation** with progress tracking
- **Vue.js component architecture** for reactive field rendering
- **File upload system** with media library integration
- **Complex validation** (client + server-side)
- **Draft saving** capability
- **Admin mode** for backend editing

**Complexity Level:** Very High (5,125 lines, 29 icon controls, 200+ styling controls)

---

## 1. Widget Controls Inventory

### 1.1 Post Type Configuration
**Location:** `themes/voxel/app/widgets/create-post.php:27-73`

```php
'ts_post_type' => [
    'label' => 'Post type',
    'type' => SELECT,
    'options' => \Voxel\Post_Type::get_voxel_types()
]
```

**Purpose:** Select which post type this form creates/edits
**Block Attribute:** `postType: string`

### 1.2 Icons (29 total)
**Location:** `themes/voxel/app/widgets/create-post.php:76-383`

- `popup_icon` - Dropdown icon
- `info_icon` - Dialogue icon
- `ts_media_ico` - Media library icon
- `next_icon`, `prev_icon` - Navigation arrows
- `down_icon` - Down arrow
- `trash_icon` - Delete icon
- `draft_icon` - Draft save icon
- `publish_icon` - Publish icon
- `save_icon` - Save changes icon
- `success_icon` - Success icon
- `view_icon` - View post icon
- `ts_calendar_icon` - Calendar icon
- `ts_calminus_icon` - Calendar minus icon
- `ts_add_icon` - Add icon
- `ts_email_icon` - Email icon
- `ts_phone_icon` - Phone icon
- `ts_location_icon` - Location icon
- `ts_mylocation_icon` - My location icon
- `ts_minus_icon` - Minus icon
- `ts_plus_icon` - Plus icon
- `ts_list_icon` - List icon
- `ts_search_icon` - Search icon
- `ts_clock_icon` - Clock icon
- `ts_link_icon` - Link icon
- `ts_rtimeslot_icon` - Remove timeslot icon
- `ts_upload_ico` - Upload icon
- `ts_load_more` - Load more icon

**Block Attributes:** Icon picker for each

### 1.3 Styling Control Sections (30+ sections, 200+ controls)

**Form Structure:**
1. Form Head (lines 387-587) - Progress bar, steps, heading
2. Head Navigation Buttons (lines 589-771) - Next/prev styling
3. Form Footer (lines 773-802) - Footer spacing

**Field Styling:**
4. Fields General (lines 807-899) - Labels, validation
5. Input & Textarea (lines 901-1382) - Normal/hover/active states
6. Input Suffix (lines 1384-1490) - Suffix styling
7. Popup Button (lines 1494-1940) - Dropdown button styling
8. Inline Terms/List (lines 1942-2287) - Term selection styling
9. Inline Checkbox (lines 2289-2381) - Checkbox styling
10. Inline Radio (lines 2383-2478) - Radio button styling
11. Switcher (lines 2480-2536) - Toggle switch styling
12. Number Stepper (lines 2538-2703) - Stepper buttons
13. Repeater (lines 2706-2770) - Repeater container
14. Repeater Head (lines 2772-2897) - Repeater header
15. Repeater Icon Button (lines 2904-3056) - Repeater buttons
16. Form Heading (lines 3059-3091) - UI heading field
17. Form Image (lines 3093-3146) - UI image field
18. Availability Calendar (lines 3150-3456) - Full calendar styling
19. Calendar Buttons (lines 3458-3651) - Calendar controls
20. Attributes/Variations (lines 3655-3784) - Product attributes
21. Color Field (lines 3786-3864) - Color picker styling

**Button Styling:**
22. Primary Button (lines 3868-4099) - Main action button
23. Secondary Button (lines 4101-4320) - Secondary actions
24. Tertiary Button (lines 4322-4517) - Tertiary actions

**File Upload:**
25. File Field (line 4521) - Applied via `Option_Groups\File_Field::class`

**Success/Feedback:**
26. Post Submitted/Updated (lines 4523-4656) - Success screen
27. Tooltips (lines 4658-4723) - Tooltip styling
28. Dialog (lines 4725-4842) - Dialog box styling

**Popup Customization:**
29. Popups Custom Style (lines 4844-4944) - Override global popup styles

---

## 2. Core Functionality Analysis

### 2.1 Field System Architecture

**Evidence:** `themes/voxel/app/widgets/create-post.php:5002-5036`

```php
foreach ( $post_type->get_fields() as $field ) {
    if ( $post ) {
        $field->set_post( $post );
    }

    try {
        $field->check_dependencies();
    } catch ( \Exception $e ) {
        $config['errors'][] = sprintf( '[VX_CONFIG_ERROR] %s: %s',
            $field->get_key(), $e->getMessage() );
        continue;
    }

    if ( ! $field->passes_visibility_rules() ) {
        continue;
    }

    $config['fields'][ $field->get_key() ] = $field->get_frontend_config();

    if ( $field->get_type() === 'ui-step' ) {
        $config['steps'][] = $field->get_key();
    }

    foreach ( $field->get_required_scripts() as $script_handle ) {
        $required_scripts[ $script_handle ] = true;
    }
}
```

**Key Dependencies:**
- `\Voxel\Post_Type::get_fields()` - Returns field objects
- `$field->check_dependencies()` - Validates field config
- `$field->passes_visibility_rules()` - Conditional display
- `$field->get_frontend_config()` - Field config for Vue
- `$field->get_required_scripts()` - Dynamic script loading

### 2.2 Field Types Supported (30 types)

**Location:** `themes/voxel/templates/widgets/create-post/`

**1. Basic Input Fields (8):**
- `text-field.php` - Text input
- `texteditor-field.php` - Rich text editor
- `description-field.php` - Textarea
- `email-field.php` - Email input
- `url-field.php` - URL input
- `phone-field.php` - Phone input
- `number-field.php` - Number input
- `color-field.php` - Color picker

**2. Selection Fields (4):**
- `select-field.php` - Dropdown select
- `multiselect-field.php` - Multi-select
- `taxonomy-field.php` - Category/tag selector
- `switcher-field.php` - Toggle switch

**3. Date/Time Fields (5):**
- `date-field.php` - Date picker
- `time-field.php` - Time picker
- `timezone-field.php` - Timezone selector
- `recurring-date-field.php` - Recurring dates
- `work-hours-field.php` - Business hours

**4. File/Media Fields (3):**
- `file-field.php` - File upload
- `image-field.php` - Image upload
- `profile-avatar-field.php` - Avatar upload

**5. Complex Fields (7):**
- `location-field.php` - Map location picker
- `repeater-field.php` - Repeatable field groups
- `product-field.php` - Product configuration
- `post-relation-field.php` - Related posts
- `profile-name-field.php` - Profile name
- `title-field.php` - Post title

**6. UI Fields (3):**
- `ui-heading-field.php` - Heading text
- `ui-html-field.php` - Custom HTML
- `ui-image-field.php` - Display image

### 2.3 Render Flow

**Widget render()** (`themes/voxel/app/widgets/create-post.php:4954-5058`):
1. Check user logged in
2. Get post type from widget settings
3. Determine if editing existing post or creating new
4. Build config array with:
   - `post_type` key
   - `post` (if editing)
   - `fields` array from post type
   - `steps` array
   - `errors` array
   - `autocomplete` config
   - `validation_errors` messages
5. Register required scripts dynamically
6. Load template: `templates/widgets/create-post.php`

**Template** (`themes/voxel/templates/widgets/create-post.php`):
1. Check permissions
2. Output JSON config for Vue
3. Render form structure with Vue directives
4. Loop through fields and output Vue components
5. Load deferred field templates
6. Render success screen (conditional)
7. Render navigation and submit buttons

### 2.4 Vue.js Architecture

**Main Script:** `vx:create-post.js`
**Dependencies:** Dynamically loaded per field type
**Styles:** `vx:forms.css`, `vx:create-post.css`, `vx:map.css`

**Vue Data Structure:**
```javascript
{
    post_type: { key: 'post-type-slug' },
    post: { id: 123, status: 'publish' }, // if editing
    fields: {
        'field-key': {
            key: 'field-key',
            type: 'text',
            label: 'Field Label',
            required: true,
            value: '',
            validation: { errors: [] },
            // ... field-specific config
        }
    },
    steps: ['step-1-key', 'step-2-key'],
    step_index: 0,
    submission: {
        processing: false,
        done: false,
        message: '',
        status: '',
        viewLink: '',
        editLink: ''
    }
}
```

**Key Vue Methods:**
- `nextStep(validate)` - Navigate to next step
- `prevStep()` - Navigate to previous step
- `submit()` - Submit form
- `saveDraft()` - Save as draft
- `validate_field(field_key)` - Validate single field
- `conditionsPass(field)` - Check field visibility conditions

### 2.5 Form Submission

**Endpoint:** REST API (need to discover endpoint)
**Method:** POST
**Data:** All field values from Vue data

**Evidence:** JavaScript file needs inspection, not visible in PHP

### 2.6 Validation System

**Client-Side Messages** (`themes/voxel/app/widgets/create-post.php:5098-5123`):

```php
protected function _get_validation_errors() {
    return [
        'required' => 'Required',
        'text:minlength' => 'Value cannot be shorter than @minlength characters',
        'text:maxlength' => 'Value cannot be longer than @maxlength characters',
        'text:pattern' => 'Please match the requested format',
        'email:invalid' => 'You must provide a valid email address',
        'number:min' => 'Value cannot be less than @min',
        'number:max' => 'Value cannot be more than @max',
        'url:invalid' => 'You must provide a valid URL',
        'relation:max' => 'You cannot pick more than @max items',
        'file:max' => 'You cannot pick more than @max files',
        'file:size' => '@filename is over the @limit_mb MB limit',
        'file:type' => 'Unsupported file type: @filename',
        'recurring-date:max' => 'You cannot add more than @max dates',
        'recurring-date:empty' => 'Date cannot be empty',
        'recurring-date:missing-until' => 'Recurring dates must have a final date set',
        'color:invalid' => 'You must provide a valid color',
        'location:invalid_position' => 'The provided coordinates are not valid',
        'repeater:min' => 'You must add at least @min entries',
        'repeater:max' => 'You cannot add more than @max entries',
        'repeater:missing-addition-data' => 'Label and price are required',
        'repeater:missing-addition-quantity' => 'Quantity is required',
        'repeater:row-error' => 'Missing data',
        'form:has-errors' => 'Please fill in all required fields',
    ];
}
```

**Server-Side:** Handled by Voxel post type validation system (need to discover)

---

## 3. Voxel Dependencies

### 3.1 Core Classes Used

**Post Type System:**
- `\Voxel\Post_Type::get()` - Get post type by key
- `\Voxel\Post_Type::get_voxel_types()` - Get all post types
- `$post_type->get_fields()` - Get field definitions
- `$post_type->get_key()` - Get post type slug

**Post Objects:**
- `\Voxel\Post::get()` - Get post by ID
- `\Voxel\Post::current_user_can_edit()` - Permission check
- `$post->get_id()` - Get post ID
- `$post->get_status()` - Get post status
- `$post->post_type` - Access post type

**Field Objects:**
- `$field->set_post()` - Attach post context
- `$field->check_dependencies()` - Validate dependencies
- `$field->passes_visibility_rules()` - Check visibility
- `$field->get_frontend_config()` - Get Vue config
- `$field->get_key()` - Get field key
- `$field->get_type()` - Get field type
- `$field->get_step()` - Get step assignment
- `$field->get_required_scripts()` - Get script dependencies

**User System:**
- `\Voxel\get_current_user()` - Get current user object
- `$user->get_or_create_profile()` - Get/create profile post
- `$user->can_create_post()` - Permission check

**Utilities:**
- `\Voxel\get()` - Get settings (maps, autocomplete)
- `\Voxel\get_icon_markup()` - Render icon HTML
- `\Voxel\svg()` - Get SVG icon
- `\Voxel\is_edit_mode()` - Check if Elementor edit mode
- `\Voxel\is_dev_mode()` - Check if dev mode

### 3.2 Required Scripts (Dynamic)

**Base Scripts:**
- `vx:create-post.js` - Main Vue app
- Per-field scripts loaded dynamically

**Base Styles:**
- `vx:forms.css` - Form styling
- `vx:create-post.css` - Create post specific
- `vx:map.css` - Map field styling

### 3.3 Settings Integration

**Map Provider Config** (`themes/voxel/app/widgets/create-post.php:5077-5096`):

```php
protected function _get_autocomplete_config() {
    if ( \Voxel\get( 'settings.maps.provider' ) === 'mapbox' ) {
        return [
            'countries' => \Voxel\get( 'settings.maps.mapbox.autocomplete.countries' ),
            'feature_types' => \Voxel\get( 'settings.maps.mapbox.autocomplete.feature_types_in_submission' ),
        ];
    } else {
        // Google Maps config
        return [
            'countries' => \Voxel\get( 'settings.maps.google_maps.autocomplete.countries' ),
            'feature_types' => // ... complex logic for Google
        ];
    }
}
```

---

## 4. File Upload System

**Evidence:** Line 4521 applies file field controls:
```php
$this->apply_controls( Option_Groups\File_Field::class );
```

**Need to investigate:**
- `themes/voxel/app/widgets/option-groups/file-field.php`
- `templates/widgets/create-post/_media-popup.php` (line 17)
- `templates/components/file-upload.php` (line 18)

---

## 5. Admin Mode

**Evidence:** `themes/voxel/app/widgets/create-post.php:4966-4974`

```php
$is_admin_mode = !! $this->get_settings('_ts_admin_mode');

$config = [
    'is_admin_mode' => $is_admin_mode,
    'admin_mode_nonce' => $this->get_settings('_ts_admin_mode_nonce'),
    // ...
];
```

**Purpose:** Allow editing posts from WordPress admin
**Security:** Uses nonce verification

---

## 6. Conversion Strategy

### 6.1 Block Attribute Schema

Based on analysis, we need these attributes:

```json
{
  "attributes": {
    "postType": {
      "type": "string",
      "default": ""
    },
    "icons": {
      "type": "object",
      "default": {
        "popup": "",
        "info": "",
        "media": "",
        "next": "",
        "prev": "",
        "down": "",
        "trash": "",
        "draft": "",
        "publish": "",
        "save": "",
        "success": "",
        "view": "",
        "calendar": "",
        "calendarMinus": "",
        "add": "",
        "email": "",
        "phone": "",
        "location": "",
        "myLocation": "",
        "minus": "",
        "plus": "",
        "list": "",
        "search": "",
        "clock": "",
        "link": "",
        "removeTimeslot": "",
        "upload": "",
        "loadMore": ""
      }
    },
    "formHead": {
      "type": "object",
      "default": {
        "hide": false,
        "bottomSpacing": "",
        "stepsBarHide": false,
        "stepsBarHeight": "",
        "stepsBarRadius": "",
        "stepsBarBg": "",
        "stepsBarDone": "",
        "currentStepTypography": {},
        "currentStepColor": ""
      }
    },
    // ... MANY more nested objects for all styling controls
    "customPopupEnable": {
      "type": "boolean",
      "default": false
    },
    "popupBackdropColor": {
      "type": "string",
      "default": ""
    }
  }
}
```

**Challenge:** 200+ styling controls = very large attribute schema

**Solution:** Group related attributes into nested objects

### 6.2 Implementation Phases

**Phase A: Foundation (Days 1-4)**
1. Basic block structure with minimal attributes
2. Connect to Voxel Post Type system
3. Fetch field definitions from post type
4. Render simple text field as proof of concept
5. Basic form submission (no validation)

**Phase B: Field Rendering (Days 5-10)**
1. Implement field type factory
2. Create React components for each of 30 field types
3. Match HTML structure from Voxel templates exactly
4. Integrate with Voxel's field system
5. Handle field visibility rules

**Phase C: Validation & Submission (Days 11-13)**
1. Implement client-side validation
2. Create REST API endpoint for submission
3. Server-side validation using Voxel system
4. Draft saving functionality
5. Success/error handling

**Phase D: Polish & Styling (Days 14-15)**
1. Implement InspectorControls for all 200+ settings
2. Match all Voxel styling options
3. File upload integration
4. Multi-step navigation
5. Testing and bug fixes

### 6.3 Critical Decisions

**Q1: Reuse Voxel Vue Components or Build React?**
- **Option A:** Use Voxel's Vue components via interop
  - ✅ Pro: Perfect 1:1 match guaranteed
  - ❌ Con: Vue/React mixing complexity
  - ❌ Con: Maintenance burden

- **Option B (RECOMMENDED):** Build React equivalents
  - ✅ Pro: Native WordPress block experience
  - ✅ Pro: Better Gutenberg integration
  - ✅ Pro: Easier maintenance
  - ❌ Con: Must match Voxel HTML/CSS exactly
  - ❌ Con: More initial work

**Q2: Server-Side Rendering Strategy**
- Must use `render.php` to output Vue app structure
- Cannot use WordPress block rendering in FSE since this is dynamic
- **Solution:** PHP renders Vue app shell, Vue handles interactivity

**Q3: How to Handle Field Type Complexity?**
- **Recommended:** Create abstract `FieldBase` React component
- Each field type extends base with specific rendering
- Share validation, styling, error display logic

### 6.4 Risk Assessment

**High Risk:**
1. ❌ **File Upload** - Complex media library integration
2. ❌ **Repeater Fields** - Nested field rendering
3. ❌ **Product Fields** - E-commerce specific logic
4. ❌ **Location Fields** - Map provider integration

**Medium Risk:**
1. ⚠️ **Validation System** - Client + server parity
2. ⚠️ **Multi-Step Navigation** - State management
3. ⚠️ **Field Visibility Rules** - Conditional logic

**Low Risk:**
1. ✅ **Basic Fields** - Text, email, number, etc.
2. ✅ **Styling Controls** - Standard Gutenberg patterns
3. ✅ **Success Screen** - Simple conditional render

---

## 7. Next Steps (Step 1.2-1.4)

### Step 1.2: Identify Dependencies (NEXT)
- [ ] Inspect `assets/js/src/create-post.js` for Vue implementation
- [ ] Map all Voxel field classes used
- [ ] Document REST API endpoints
- [ ] List required WordPress hooks
- [ ] Identify JavaScript libraries (Vue, date pickers, map APIs)

### Step 1.3: Map Controls to Attributes
- [ ] Create complete block.json attribute schema
- [ ] Group styling controls logically
- [ ] Define TypeScript interfaces
- [ ] Document default values

### Step 1.4: Create Conversion Plan
- [ ] Write detailed implementation roadmap
- [ ] Define milestone deliverables
- [ ] Create testing checklist
- [ ] Document known challenges and solutions

---

## 8. Questions for User

1. **Field Type Priority:** Should we implement all 30 field types or start with a subset?
2. **Styling Completeness:** All 200+ controls or just essential ones first?
3. **Vue vs React:** Confirm we're building React components (not reusing Vue)?
4. **Admin Mode:** Is admin mode editing required in Phase 1?
5. **Draft Saving:** Required immediately or can be added later?

---

## Appendix: File References

**Core Files:**
- Widget: `themes/voxel/app/widgets/create-post.php`
- Template: `themes/voxel/templates/widgets/create-post.php`
- Vue Script: `assets/js/src/create-post.js` (need to inspect)
- Styles: `assets/css/create-post.css` (need to inspect)

**Field Templates:** `themes/voxel/templates/widgets/create-post/*-field.php` (30 files)

**Target Block:** `themes/voxel-fse/app/blocks/src/create-post/`

---

**End of Step 1 Analysis**

Next: Continue to Step 1.2 - Dependencies Analysis

## 9. Step 1.2: Dependencies & API Analysis COMPLETED

### 9.1 AJAX Endpoint System

**Custom AJAX Handler** (`themes/voxel/app/controllers/ajax-controller.php`):

Voxel uses a custom AJAX system:
- **URL Pattern:** `?vx=1&action={action_name}`
- **Hooks:** `voxel_ajax_{action}` (logged in) or `voxel_ajax_nopriv_{action}` (logged out)

### 9.2 Create Post Submission Endpoint

**Primary Handler:** `themes/voxel/app/controllers/frontend/create-post/submission-controller.php`

**URL:** `?vx=1&action=create_post&post_type={post_type}&post_id={post_id}`

**Request Format:**
- `$_GET['post_type']` - Post type key
- `$_GET['post_id']` - Post ID if editing  
- `$_POST['postdata']` - JSON field data
- `$_REQUEST['save_as_draft']` - "yes" for draft
- FormData for file uploads

**Response Format:**
```json
{
  "success": true,
  "edit_link": "...",
  "view_link": "...",
  "message": "...",
  "status": "publish"
}
```

### 9.3 Submission Flow (5 Steps)

1. **Sanitization** - `$field->sanitize($value)`
2. **Visibility Rules** - `$field->passes_visibility_rules()`
3. **Conditional Logic** - `$field->passes_conditional_logic($values)`
4. **Validation** - `$field->check_validity($value)`
5. **Post Update** - `wp_insert_post()` / `$field->update($value)`

### 9.4 Vue.js Components (30+ field types)

**Main App:** `window.render_create_post()`
**Field Components:** field-{type} for each of 30 types
**Utilities:** media-popup, term-list, file-upload, date pickers

### 9.5 JavaScript Dependencies

1. **Vue.js 3** - Reactive framework
2. **Pikaday** - Date picker
3. **vuedraggable** - Drag and drop
4. **jQuery** - AJAX requests
5. **TinyMCE** - Rich text editor
6. **Voxel.Maps** - Map provider abstraction

### 9.6 Voxel Field System Methods

Required field methods:
- `get_key()`, `get_type()`, `get_step()`, `get_frontend_config()`
- `passes_visibility_rules()`, `passes_conditional_logic()`
- `sanitize()`, `check_validity()`, `update()`
- `set_post()`, `check_dependencies()`

### 9.7 Conditional Logic

**22 condition types:** text:equals, taxonomy:contains, switcher:checked, number:gt, file:empty, date:gt, etc.

**Logic:** OR between groups, AND within group

---

## 10. Step 1.3 & 1.4: Implementation Plan COMPLETED

### 10.1 Phase A: Foundation (Days 1-4)

**Tasks:**
- Create block directory structure
- Set up TypeScript interfaces
- Add post type selector
- Implement 3 basic fields (text, email, number)
- Basic form submission handler

**Milestone:** Block displays fields and handles interaction

### 10.2 Phase B: Field Rendering (Days 5-10)

**Tasks:**
- Implement all 30 field types
- Match Voxel HTML exactly
- Add client-side validation
- Multi-step navigation
- Conditional logic

**Milestone:** All field types render correctly

### 10.3 Phase C: Advanced & Submission (Days 11-13)

**Tasks:**
- Repeater fields
- Product fields (complex)
- Server-side controller
- File upload handling
- Success screen

**Milestone:** End-to-end form submission

### 10.4 Phase D: Polish (Days 14-15)

**Tasks:**
- InspectorControls (icons, styling)
- Testing all field types
- Cross-browser testing
- Accessibility review
- Bug fixes

**Milestone:** Production-ready

### 10.5 Implementation Strategy

**Approach:** Build React components for editor, reuse Voxel Vue on frontend
**Complexity:** Very High (10/10)
**Estimated Time:** 15 days

---

## 11. Analysis Summary

**Widget Analyzed:** `themes/voxel/app/widgets/create-post.php` (5,125 lines)

**Key Findings:**
- 30 field types supported
- 29 customizable icons
- 200+ styling controls
- Vue.js reactive architecture
- Custom AJAX system
- 5-step server-side processing
- Complex product/booking fields
- File upload with session cache
- Conditional logic system
- Multi-step form navigation

**Dependencies Identified:**
- Voxel Post Type system
- Voxel Field classes (30+)
- Vue.js, Pikaday, TinyMCE
- Custom AJAX endpoint
- Map provider APIs

**Conversion Strategy:**
- React for block editor
- Match Voxel HTML/CSS exactly
- 4 phases over 15 days
- Incremental testing
- Start with simple fields

**Risk Areas:**
- Product fields (very complex)
- File uploads & media library
- Map integration
- Repeater fields (nested)

---

**ANALYSIS COMPLETE - Ready for Implementation**
