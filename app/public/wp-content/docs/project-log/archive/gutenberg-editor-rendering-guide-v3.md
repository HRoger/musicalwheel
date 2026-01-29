# Gutenberg Editor Rendering Guide V3: Create Post Block

**Last Updated:** November 2025
**Context:** Create Post Block - Editor Preview & Admin Metabox Implementation
**Supersedes:** gutenberg-editor-rendering-guide-v2.md

---

## Overview

This guide documents how the Create Post block renders in the Gutenberg editor, focusing on the **dual rendering contexts**:
1. **Editor Preview** - Static HTML preview when block is inserted in post/page editor
2. **Admin Metabox** - Fully interactive React form in WordPress admin post edit screen

This is a complex implementation because the Create Post block is not just a "preview" block - it's a **fully functional form** that needs to work in multiple contexts with different rendering strategies.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Rendering Context Detection](#rendering-context-detection)
3. [Editor Preview Implementation](#editor-preview-implementation)
4. [Admin Metabox Implementation](#admin-metabox-implementation)
5. [Key Technical Decisions](#key-technical-decisions)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Code Reference](#code-reference)

---

## Architecture Overview

### The Three Rendering Contexts

The Create Post block must handle three distinct contexts:

| Context | Location | Rendering Strategy | Interactivity |
|---------|----------|-------------------|---------------|
| **Frontend** | User-facing post submission pages | React component (create-post-frontend.js) | ✅ Full |
| **Editor Preview** | Gutenberg block editor | Static HTML via render.php | ❌ None |
| **Admin Metabox** | WordPress admin post edit screen | React component in iframe | ✅ Full |

### Why Different Strategies?

**Editor Preview - Static HTML:**
- Block is being configured, not used
- User needs to see what the form will look like
- No actual form submission needed
- ServerSideRender would be too slow for complex forms
- Static preview is faster and sufficient

**Admin Metabox - Full React:**
- Users need to edit existing posts' custom fields
- Form must be fully interactive (validation, AJAX, etc.)
- Replaces Voxel's Elementor metabox
- Must match Voxel's admin editing UX exactly

---

## Rendering Context Detection

### File: `render.php` (Lines 443-459)

The render.php file needs to detect which context it's running in to choose the appropriate rendering strategy.

#### Context Detection Code

```php
// Detect admin/editor context
$is_admin_context = is_admin() || doing_action('do_meta_boxes') ||
    (function_exists('get_current_screen') && get_current_screen() &&
     get_current_screen()->is_block_editor());

// Detect if we're specifically in the admin metabox (not Gutenberg editor)
$is_admin_metabox = !empty($attributes['_admin_mode']) &&
                     !empty($attributes['_admin_post_id']);

// Improved editor preview detection
$is_rest = defined('REST_REQUEST') && REST_REQUEST;
$is_block_renderer = strpos($_SERVER['REQUEST_URI'] ?? '', '/wp-json/wp/v2/block-renderer/') !== false;
$is_editor_preview = ($is_admin_context && !$is_admin_metabox) ||
                      $is_rest ||
                      $is_block_renderer ||
                      (isset($_GET['context']) && $_GET['context'] === 'edit');
```

#### Key Detection Variables

| Variable | Purpose | How It's Set |
|----------|---------|--------------|
| `$is_admin_context` | Detects ANY admin area (editor or metabox) | WordPress functions |
| `$is_admin_metabox` | Specifically the admin metabox iframe | Custom attributes `_admin_mode` and `_admin_post_id` |
| `$is_editor_preview` | Gutenberg block editor preview | REST API detection or block renderer endpoint |

#### Why This Matters

**CRITICAL:** The admin metabox is also "admin" context, so we can't just check `is_admin()`. We need to distinguish between:
- **Gutenberg editor** → Render static HTML preview
- **Admin metabox** → Render full React component

The `_admin_mode` and `_admin_post_id` attributes are passed explicitly by the metabox to flag this context.

---

## Editor Preview Implementation

### Strategy: Static HTML Matching Voxel's Elementor Preview

When a user inserts the Create Post block in the Gutenberg editor, they see a **static HTML preview** that matches what the form will look like on the frontend.

### File: `render.php` (Lines 460-787)

#### Step 1: Detect Editor Preview Mode

```php
if ($is_editor_preview) {
    error_log('Is Editor Preview: Yes');

    // Render static HTML preview...
}
```

#### Step 2: Group Fields by Steps

The form uses multi-step UI with `ui-step` field types. We need to group fields into steps for preview:

```php
function voxel_fse_group_fields_by_steps($fields_config) {
    $steps = [];
    $current_step = ['key' => 'default', 'label' => 'Form', 'fields' => []];

    foreach ($fields_config as $field) {
        if ($field['type'] === 'ui-step') {
            // Save previous step
            if (!empty($current_step['fields'])) {
                $steps[] = $current_step;
            }
            // Start new step
            $current_step = [
                'key' => $field['key'],
                'label' => $field['label'],
                'fields' => []
            ];
        } else {
            // Add field to current step
            $current_step['fields'][] = $field;
        }
    }

    // Add final step
    if (!empty($current_step['fields'])) {
        $steps[] = $current_step;
    }

    return $steps;
}
```

#### Step 3: Render Static HTML Preview

The preview HTML matches Voxel's Elementor widget structure exactly:

```php
<div class="ts-form ts-create-post create-post-form">
    <!-- Progress bar (if multiple steps) -->
    <?php if (count($steps) > 1) : ?>
    <div class="ts-stepper">
        <div class="step-percentage">
            <div class="step-progress"></div>
        </div>
        <div class="step-tabs simplify-ul">
            <?php foreach ($steps as $index => $step) : ?>
            <a href="#" class="<?= $index === 0 ? 'current-step' : '' ?>"
               data-step="<?= esc_attr($index) ?>">
                <?= esc_html($step['label']) ?>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>

    <!-- Form steps -->
    <div class="ts-form-steps">
        <?php foreach ($steps as $step_index => $step) : ?>
        <form class="ts-step-content <?= $step_index === 0 ? 'ts-form-show' : '' ?>"
              data-step="<?= esc_attr($step_index) ?>">

            <?php foreach ($step['fields'] as $field) : ?>
                <?php voxel_fse_render_field_preview($field); ?>
            <?php endforeach; ?>

        </form>
        <?php endforeach; ?>
    </div>

    <!-- Navigation -->
    <div class="ts-form-footer flexify">
        <?php if (count($steps) > 1) : ?>
        <ul class="ts-nextprev simplify-ul flexify">
            <li class="flexify">
                <a href="#" class="ts-btn ts-btn-1 disabled">
                    <i class="las la-arrow-left"></i> Previous
                </a>
            </li>
            <li class="flexify">
                <a href="#" class="ts-btn ts-btn-1">
                    Next <i class="las la-arrow-right"></i>
                </a>
            </li>
        </ul>
        <?php endif; ?>
    </div>
</div>
```

#### Step 4: Render Individual Fields

Each field type gets a preview representation:

```php
function voxel_fse_render_field_preview($field) {
    $type = $field['type'];
    $label = $field['label'] ?? '';
    $required = !empty($field['required']);

    switch ($type) {
        case 'text':
        case 'email':
        case 'url':
            echo '<div class="ts-form-group">';
            echo '<label>' . esc_html($label);
            if ($required) echo ' <span class="required">*</span>';
            echo '</label>';
            echo '<input type="' . esc_attr($type) . '" placeholder="' .
                 esc_attr($label) . '" disabled>';
            echo '</div>';
            break;

        case 'texteditor':
            // WP Editor preview
            echo '<div class="ts-form-group">';
            echo '<label>' . esc_html($label);
            if ($required) echo ' <span class="required">*</span>';
            echo '</label>';
            echo '<div class="wp-editor-preview">';
            echo '<div class="wp-editor-tabs">';
            echo '<button class="wp-switch-editor active">Visual</button>';
            echo '<button class="wp-switch-editor">Text</button>';
            echo '</div>';
            echo '<textarea rows="8" disabled></textarea>';
            echo '</div>';
            echo '</div>';
            break;

        case 'select':
            // Dropdown preview
            echo '<div class="ts-form-group">';
            echo '<label>' . esc_html($label);
            if ($required) echo ' <span class="required">*</span>';
            echo '</label>';
            echo '<select disabled>';
            echo '<option>Select ' . esc_html($label) . '</option>';
            echo '</select>';
            echo '</div>';
            break;

        // ... more field types
    }
}
```

### Why Static HTML Preview?

**Advantages:**
- ✅ **Fast rendering** - No React bundle loading in editor
- ✅ **Accurate preview** - Shows exact HTML structure and CSS
- ✅ **No interactivity needed** - Block is being configured, not used
- ✅ **Matches Voxel pattern** - Voxel's Elementor widgets use static previews

**Disadvantages:**
- ❌ No live validation preview
- ❌ Can't test form submission in editor
- ❌ Must maintain preview HTML separately from React component

**Decision:** The advantages outweigh the disadvantages for editor preview use case.

---

## Admin Metabox Implementation

### Strategy: Full React Component in Iframe (1:1 Voxel Match)

The admin metabox renders the **actual React form** inside an iframe, exactly matching Voxel's Elementor metabox implementation.

### Architecture: Iframe + postMessage Communication

```
┌─────────────────────────────────────────┐
│ WordPress Admin Post Edit Screen        │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Create Post Metabox                │ │
│  │                                     │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │ <iframe> (Isolated Context)   │  │ │
│  │  │                               │  │ │
│  │  │  [React Form Component]       │  │ │
│  │  │  - Full interactivity         │  │ │
│  │  │  - Validation                 │  │ │
│  │  │  - AJAX submission            │  │ │
│  │  │                               │  │ │
│  │  └──────────────────────────────┘  │ │
│  │         ↕ postMessage                │ │
│  │  [Button Interception JavaScript]  │ │
│  │  - Intercepts WP Update button     │ │
│  │  - Calls iframe submit method      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [WordPress Update Button]               │
└─────────────────────────────────────────┘
```

### File: `admin-metabox.php`

#### Step 1: Register Metabox

```php
function voxel_fse_add_create_post_metabox() {
    $post = \Voxel\Post::get(get_post());
    if (!($post && $post->is_managed_by_voxel())) {
        return;
    }

    $post_type_key = $post->post_type->get_key();

    // Remove Voxel's Elementor metabox first
    remove_meta_box('voxel_post_fields', $post_type_key, 'normal');

    // Add our FSE metabox with the SAME ID as Voxel's
    add_meta_box(
        'voxel_post_fields', // Use Voxel's ID to replace seamlessly
        gutenberg-editor-rendering-guide-v3.md__('Fields', 'voxel-fse') . sprintf(
            '<a href="%s" target="_blank">%s</a>',
            esc_url($post->get_edit_link()),
            __('Edit in frontend form', 'voxel-fse')
        ),
        'voxel_fse_render_create_post_metabox',
        $post_type_key,
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'voxel_fse_add_create_post_metabox', 20);
```

**Evidence:** 1:1 match with Voxel's `themes/voxel/app/controllers/post-controller.php:20-40`

#### Step 2: Render Iframe

```php
function voxel_fse_render_create_post_metabox($wp_post) {
    $admin_mode_nonce = wp_create_nonce('vx_create_post_admin_mode');
    $post_type = \Voxel\Post_Type::get($wp_post->post_type);

    $iframe_url = add_query_arg([
        'action' => 'voxel_fse_admin_get_fields_form',
        'post_type' => $post_type->get_key(),
        'post_id' => $wp_post->ID,
        '_wpnonce' => $admin_mode_nonce,
    ], home_url('/?vx=1'));
    ?>
    <div id="vx-fields-wrapper-fse">
        <iframe
            data-src="<?= esc_attr($iframe_url) ?>"
            style="width: 100%; display: block; min-width: 100vw;"
            frameborder="0"
        ></iframe>
    </div>

    <style>
        #vx-fields-wrapper-fse {
            display: flex;
            justify-content: center;
            overflow: hidden;
        }
    </style>

    <script>
        // Setup iframe loading and button interception...
    </script>
    <?php
}
```

**Evidence:** 1:1 match with Voxel's `themes/voxel/templates/backend/edit-post-metabox.php:17-26`

#### Step 3: Button Interception (Critical!)

This is the most complex part. WordPress has an "Update" button that normally saves the post. We need to:
1. Intercept the Update button click
2. Prevent WordPress from saving immediately
3. Call the iframe's React form submit method
4. Wait for form to submit via AJAX
5. Then allow WordPress to save

```javascript
jQuery(document).ready(function($) {
    var wrapper = document.getElementById('vx-fields-wrapper-fse');
    var iframe = wrapper.querySelector('iframe');

    var formSubmitted = false;
    var updateButton = null;
    var clickHandlersAttached = false;

    // Setup observer for iframe mount
    var setupObserver = function(event) {
        if (event.data === 'create-post:mounted') {
            requestAnimationFrame(function() {
                var iframeBody = iframe.contentWindow.document.body;

                // Dynamic iframe height
                iframe.style.height = iframeBody.offsetHeight + 'px';

                // ATTACH button handlers AFTER iframe has mounted
                if (!clickHandlersAttached) {
                    clickHandlersAttached = true;

                    // Intercept #publish and #save-post buttons
                    Array.from(document.querySelectorAll('#publish, #save-post'))
                        .forEach(function(button) {
                            button.addEventListener('click', function(event) {
                                updateButton = event.currentTarget;

                                if (!formSubmitted) {
                                    // Prevent WordPress save
                                    event.preventDefault();

                                    // Call iframe's exposed submit method
                                    var formElement = iframe.contentWindow.document
                                        .querySelector('.ts-create-post');

                                    if (formElement && formElement.voxelSubmit) {
                                        formElement.voxelSubmit();
                                    } else if (iframe.contentWindow.voxelFseSubmit) {
                                        iframe.contentWindow.voxelFseSubmit();
                                    }

                                    // Visual feedback
                                    wrapper.classList.add('ts-saving');
                                    updateButton.classList.add('vx-disabled');
                                }
                            });
                        });
                }
            });
        }
    };

    // Listen for form submission success
    window.addEventListener('message', function(event) {
        if (event.data === 'create-post:submitted') {
            formSubmitted = true;

            if (updateButton) {
                // Remove disabled state and re-click to save WP fields
                updateButton.classList.remove('vx-disabled');
                updateButton.click();
            }
        }
    });

    window.addEventListener('message', setupObserver);
    iframe.src = iframe.getAttribute('data-src');
});
```

**Evidence:** 1:1 match with Voxel's `themes/voxel/assets/dist/backend.js`

#### Step 4: React Component Integration

The React component (CreatePostForm.tsx) must:

1. **Expose submit method** for parent window to call
2. **Send postMessage** after successful submission

```typescript
// CreatePostForm.tsx

// 1. Create ref to form element
const formRef = useRef<HTMLDivElement>(null);

// 2. Expose submit method on mount
useEffect(() => {
    // Attach to DOM element
    if (formRef.current) {
        (formRef.current as any).voxelSubmit = handleSubmit;
    }

    // Also expose on window
    (window as any).voxelFseSubmit = handleSubmit;

    // Notify parent that we've mounted
    window.parent.postMessage('create-post:mounted', '*');
}, [handleSubmit]);

// 3. Send postMessage after successful submission
const handleSubmit = async () => {
    try {
        // Submit form via AJAX...
        const response = await submitFormData();

        if (response.success) {
            // Notify parent window
            window.parent.postMessage('create-post:submitted', '*');
        }
    } catch (error) {
        // Handle error...
    }
};

// 4. Attach ref to form element
return (
    <div ref={formRef} className="ts-create-post">
        {/* Form fields... */}
    </div>
);
```

### Why Iframe + postMessage?

**Advantages:**
- ✅ **CSS/JS isolation** - Form styles don't conflict with WordPress admin
- ✅ **1:1 Voxel match** - Exact same pattern as Voxel's Elementor metabox
- ✅ **Full React features** - Hooks, state, validation all work normally
- ✅ **Clean separation** - Admin scripts don't interfere with form

**Disadvantages:**
- ❌ **Complexity** - Requires postMessage coordination
- ❌ **Timing issues** - Must wait for iframe to mount before attaching handlers
- ❌ **Height management** - Need ResizeObserver for dynamic height

**Decision:** The 1:1 Voxel match requirement makes iframe approach mandatory.

---

## Key Technical Decisions

### 1. Why Not ServerSideRender for Editor Preview?

**Considered:** Using WordPress `ServerSideRender` component to render preview

**Rejected because:**
- Create Post form is complex with 30+ fields
- ServerSideRender uses REST API, adding latency on every attribute change
- Static HTML preview is sufficient for configuration use case
- Popup Kit block uses ServerSideRender, but it's simpler (just popup styling)

**Decision:** Static HTML preview for editor, ServerSideRender only for simple blocks

### 2. Why Expose Submit Method on Both DOM Element and Window?

**Problem:** Parent window needs to call iframe's form submit method

**Options:**
1. Only expose on window object: `iframe.contentWindow.voxelFseSubmit()`
2. Only expose on DOM element: `formElement.voxelSubmit()`
3. Both (what we chose)

**Decision:** Expose on both for maximum compatibility

**Reasoning:**
- Voxel uses `__vue_instance__` on DOM element for Vue components
- Our React component isn't Vue, so we mimic the pattern
- Window fallback ensures it works even if DOM element not found
- Defensive programming - try both, fail gracefully

### 3. Why Wait for `create-post:mounted` Before Attaching Handlers?

**Problem:** If we attach button handlers immediately, the iframe's submit method isn't exposed yet

**Original approach (broken):**
```javascript
// This ran before iframe loaded
document.querySelectorAll('#publish, #save-post').forEach(function(button) {
    button.addEventListener('click', function() {
        // ERROR: formElement.voxelSubmit is undefined!
        iframe.contentWindow.document.querySelector('.ts-create-post').voxelSubmit();
    });
});
```

**Fixed approach:**
```javascript
// Wait for iframe to signal it's ready
window.addEventListener('message', function(event) {
    if (event.data === 'create-post:mounted') {
        // NOW attach handlers - submit method is exposed
        document.querySelectorAll('#publish, #save-post').forEach(function(button) {
            button.addEventListener('click', function() {
                // SUCCESS: formElement.voxelSubmit is defined
                iframe.contentWindow.document.querySelector('.ts-create-post').voxelSubmit();
            });
        });
    }
});
```

**Decision:** Use postMessage to signal when iframe has fully mounted and exposed methods

### 4. Why Hide Submit Buttons in Admin Metabox?

**Problem:** Admin metabox has WordPress "Update" button, but form also has "Publish" / "Save Changes" buttons

**Options:**
1. Show both sets of buttons (confusing)
2. Hide WordPress button (bad UX - users expect it)
3. Hide form buttons, keep WP button (what we chose)

**Implementation:**
```typescript
// CreatePostForm.tsx
{/* Submit buttons - hide in admin metabox */}
{!wpData.isAdminMetabox && (
    <>
        <a href="#" onClick={handleSubmit} className="ts-btn ts-btn-2">
            Publish
        </a>
    </>
)}
```

**Decision:** Hide form buttons in admin metabox, keep navigation arrows

**Reasoning:**
- WordPress admin UX expects Update button in standard location
- Form's Publish button would be redundant and confusing
- Navigation arrows (Previous/Next) still needed for multi-step forms
- 1:1 match with Voxel's Elementor metabox behavior

### 5. Why Use `get_block_wrapper_attributes()` with Try-Catch?

**Problem:** Admin metabox iframe has no block context, causing `get_block_wrapper_attributes()` to fail

**Error:**
```
PHP Warning: Trying to access array offset on null in
wp-includes/class-wp-block-supports.php on line 98
```

**Solution:**
```php
// Check if we're in admin metabox mode
if ($is_admin_metabox || !function_exists('get_block_wrapper_attributes')) {
    // Build attributes manually
    $wrapper_attributes = 'class="' . esc_attr(implode(' ', $container_classes)) . '"';
} else {
    // Use Gutenberg function with try-catch
    try {
        $wrapper_attributes = get_block_wrapper_attributes([
            'class' => implode(' ', $container_classes),
        ]);
    } catch (\Throwable $e) {
        // Fallback if block context not available
        $wrapper_attributes = 'class="' . esc_attr(implode(' ', $container_classes)) . '"';
    }
}
```

**Decision:** Detect admin metabox mode explicitly and skip Gutenberg functions

---

## Troubleshooting Guide

### Problem: "Submit method not found" Error in Admin Metabox

**Symptoms:**
```
Admin metabox: Submit method not found
{
  formElement: <div class="ts-create-post">,
  hasElementMethod: false,
  hasWindowMethod: false
}
```

**Cause:** Button handlers attached before iframe fully mounted

**Fix:** Ensure handlers attach inside `setupObserver` after `'create-post:mounted'` message

**Check:**
1. Does CreatePostForm.tsx send `window.parent.postMessage('create-post:mounted', '*')`?
2. Is the postMessage sent AFTER useEffect that exposes submit method?
3. Are button handlers inside `if (event.data === 'create-post:mounted')` block?

### Problem: Navigation Arrows Disappear in Admin Metabox

**Symptoms:** Only Publish button hidden, but also Previous/Next arrows gone

**Cause:** Entire form footer wrapped in `{!wpData.isAdminMetabox && (...)}`

**Fix:** Only wrap submit buttons, not navigation arrows

```typescript
// WRONG - Hides entire footer
{!wpData.isAdminMetabox && (
    <div className="ts-form-footer">
        <ul className="ts-nextprev">...</ul>
        <a className="ts-btn">Publish</a>
    </div>
)}

// RIGHT - Only hide submit buttons
<div className="ts-form-footer">
    {steps.length > 1 && (
        <ul className="ts-nextprev">
            {/* Previous/Next always visible */}
        </ul>
    )}

    {!wpData.isAdminMetabox && (
        <>
            {/* Only hide submit buttons */}
            <a className="ts-btn">Publish</a>
        </>
    )}
</div>
```

### Problem: PHP Warning about Undefined Variable

**Symptoms:**
```
PHP Warning: Undefined variable $is_admin_mode in render.php on line 807
```

**Cause:** Trying to use variable that was never defined

**Fix:** Use already-defined `$is_admin_metabox` variable

```php
// WRONG - $is_admin_mode doesn't exist
$is_admin_metabox = $is_admin_context || $is_admin_mode || !empty($attributes['_admin_mode']);

// RIGHT - use existing variables
if ($is_admin_metabox || !function_exists('get_block_wrapper_attributes')) {
    // Admin context detected on line 450
}
```

### Problem: Styles Not Loading in Editor Preview

**Cause:** `wp_enqueue_style()` in render.php doesn't work in REST API context

**Fix:** Load styles in Block_Loader.php

```php
// app/blocks/Block_Loader.php
public function enqueue_voxel_core_styles() {
    if (is_admin() || $this->is_rest_request()) {
        wp_enqueue_style('voxel-commons');
        wp_enqueue_style('voxel-create-post');
    }
}
add_action('enqueue_block_editor_assets', [$this, 'enqueue_voxel_core_styles']);
```

### Problem: Iframe Not Loading in Admin Metabox

**Symptoms:** Empty metabox, no iframe content

**Check:**
1. Is AJAX handler registered? `add_action('voxel_ajax_voxel_fse_admin_get_fields_form', ...)`
2. Is nonce valid? Check `wp_verify_nonce($_REQUEST['_wpnonce'], 'vx_create_post_admin_mode')`
3. Does iframe have `data-src` attribute? Check metabox HTML
4. Is JavaScript loading iframe? Check `iframe.src = iframe.getAttribute('data-src')`

**Debug:**
```javascript
console.log('Iframe element:', iframe);
console.log('Iframe data-src:', iframe.getAttribute('data-src'));
console.log('Iframe loaded src:', iframe.src);
```

---

## Code Reference

### Key Files

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `render.php` | Server-side rendering logic | 443-459 (context detection)<br>460-787 (editor preview)<br>806-823 (wrapper attributes) |
| `admin-metabox.php` | Admin metabox registration & iframe | 22-50 (registration)<br>93-317 (iframe render)<br>210-315 (button interception) |
| `admin-metabox-iframe.php` | Iframe page template | 1-91 (full file) |
| `CreatePostForm.tsx` | React form component | 73-74 (form ref)<br>709-710 (postMessage)<br>812-824 (expose submit)<br>970-1091 (form footer) |
| `style.css` | Form styles | 633-692 (navigation styles) |

### postMessage Events

| Event | Direction | Sender | Purpose |
|-------|-----------|--------|---------|
| `'create-post:mounted'` | Iframe → Parent | CreatePostForm.tsx | Signal that React component has mounted and exposed submit method |
| `'create-post:submitted'` | Iframe → Parent | CreatePostForm.tsx | Signal that form submitted successfully via AJAX |

### Custom Attributes for Admin Metabox

| Attribute | Type | Purpose |
|-----------|------|---------|
| `_admin_mode` | boolean | Flags that we're in admin metabox context (not frontend or editor) |
| `_admin_post_id` | number | Post ID being edited in admin metabox |
| `_admin_nonce` | string | Nonce for admin AJAX handler |

**Usage in render.php:**
```php
$is_admin_metabox = !empty($attributes['_admin_mode']) &&
                     !empty($attributes['_admin_post_id']);
```

---

## Comparison: Editor Preview vs Admin Metabox

| Aspect | Editor Preview | Admin Metabox |
|--------|---------------|---------------|
| **Rendering** | Static HTML | Full React component |
| **File** | render.php | CreatePostForm.tsx |
| **Interactivity** | None (disabled inputs) | Full (validation, AJAX) |
| **Styles** | Block CSS + editor.css | Block CSS (in iframe) |
| **Context detection** | `$is_editor_preview` | `$is_admin_metabox` |
| **Submit button** | Shown (disabled) | Hidden (use WP Update) |
| **Navigation arrows** | Shown (disabled) | Shown (enabled) |
| **Purpose** | Preview what form looks like | Edit existing post fields |
| **Performance** | Fast (static HTML) | React bundle load |
| **1:1 Voxel match** | Elementor preview | Elementor metabox |

---

## Best Practices

### ✅ DO

1. **Detect context explicitly**
   - Use dedicated variables for each context
   - Don't assume `is_admin()` means editor or metabox
   - Check for `_admin_mode` attribute to flag metabox

2. **Match Voxel behavior exactly**
   - Research Voxel's Elementor implementation first
   - Use same HTML structure and CSS classes
   - Replicate iframe + postMessage pattern for metabox

3. **Wait for iframe mount**
   - Use postMessage to signal when iframe is ready
   - Attach button handlers AFTER mount signal
   - Expose submit methods in useEffect

4. **Provide both rendering strategies**
   - Static HTML for editor preview (fast)
   - Full React for admin metabox (interactive)
   - Detect context and choose appropriately

5. **Handle edge cases gracefully**
   - Try-catch for `get_block_wrapper_attributes()`
   - Fallback to window method if DOM method fails
   - Check if functions exist before calling

### ❌ DON'T

1. **Don't use ServerSideRender for complex forms**
   - Too slow for 30+ field forms
   - Adds latency on every attribute change
   - Static HTML preview is sufficient

2. **Don't attach iframe handlers immediately**
   - Submit method not exposed yet
   - Will result in "method not found" errors
   - Wait for `'create-post:mounted'` message

3. **Don't hide navigation arrows in metabox**
   - Only hide submit buttons
   - Users still need multi-step navigation
   - Matches Voxel's metabox UX

4. **Don't assume admin context means editor**
   - Admin metabox is also admin
   - Need `_admin_mode` flag to distinguish
   - Different rendering strategies for each

5. **Don't call Gutenberg functions in iframe**
   - No block context in admin metabox
   - `get_block_wrapper_attributes()` will fail
   - Build attributes manually instead

---

## Related Documentation

- **Popup Kit Guide:** `gutenberg-editor-rendering-guide-v2.md` (ServerSideRender approach)
- **Voxel Discovery:** `docs/voxel-discovery/` (Voxel architecture analysis)
- **Widget Conversion:** `docs/voxel-widget-block-conversion/` (Elementor to FSE patterns)
- **Admin Metabox Code:** `app/utils/admin-metabox.php`
- **Create Post Block:** `app/blocks/src/create-post/`

---

## Changelog

### November 2025 - V3 Initial Release
- Documented dual rendering contexts (editor + metabox)
- Explained static HTML preview strategy
- Detailed iframe + postMessage admin metabox implementation
- Captured button interception timing solution
- Added troubleshooting guide for common issues
- Compared approaches and explained technical decisions

---

**Remember:** The Create Post block has TWO distinct use cases (preview vs edit), requiring TWO different rendering strategies. Always detect context first, then choose the appropriate rendering approach.
