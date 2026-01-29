# FSE Templates Integration - Link Intercept & MutationObserver Explained

**Created:** November 2025
**Purpose:** Explain how Voxel admin "Edit Template" links are intercepted and redirected to FSE Site Editor

---

## Table of Contents

1. [Overview](#overview)
2. [The URL Format](#the-url-format)
3. [The Problem](#the-problem)
4. [The Solution Architecture](#the-solution-architecture)
5. [How MutationObserver Works](#how-mutationobserver-works)
6. [Complete Flow Diagram](#complete-flow-diagram)
7. [Implementation Details](#implementation-details)

---

## Overview

When you click "Edit Template" in Voxel's admin interface, instead of opening Elementor editor, it opens WordPress Site Editor with the FSE template.

**Example URL:**
```
/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-form&canvas=edit
```

This works through a **combination of**:
1. **Auto-creation of FSE templates** (wp_template posts)
2. **URL mapping** (Elementor template ID → FSE Site Editor URL)
3. **MutationObserver** (watches DOM for Vue.js changes)
4. **AJAX interception** (captures new template creation)
5. **Link replacement** (changes href attributes in real-time)

**No page reload needed!** Pure JavaScript DOM manipulation.

---

## The URL Format

### FSE Site Editor URL Structure:

```
https://example.com/wp-admin/site-editor.php?postType=wp_template&postId=TEMPLATE_ID&canvas=edit
```

**Parameters:**
- `postType=wp_template` - Tells Site Editor we're editing a template
- `postId=voxel-fse//voxel-places-form` - The template slug (theme//template-name)
- `canvas=edit` - Opens in full-screen editor mode

### How Template ID is Constructed:

**File:** `themes/voxel-fse/app/utils/fse-template-editor.php:87-93`

```php
$site_editor_url = add_query_arg(
    array(
        'postId'   => $template_id,  // Format: "voxel-fse//voxel-places-form"
        'postType' => 'wp_template',
    ),
    admin_url( 'site-editor.php' )
);
```

**Template ID Format:** `{theme-slug}//{template-slug}`

Example:
```
voxel-fse//voxel-places-form
voxel-fse//voxel-places-single
voxel-fse//voxel-header-main
```

---

## The Problem

### Voxel Uses Vue.js for Dynamic Rendering

Voxel's admin interface uses **Vue.js** to render templates dynamically:

```javascript
// Voxel's code (simplified)
window.Post_Type_Config = {
    templates: {
        single: 123,  // Elementor template ID
        card: 456,
        archive: 789,
        form: 101
    }
};

// Vue renders "Edit Template" buttons
<a :href="editWithElementor($root.config.templates.single)">
    Edit Template
</a>
```

**Vue generates:**
```html
<a href="/wp-admin/post.php?post=123&action=elementor">
    Edit Template
</a>
```

### The Challenge:

1. **Vue renders AFTER page load** - Can't just change HTML on server
2. **Vue updates DOM dynamically** - Links appear/change after JavaScript runs
3. **AJAX creates new templates** - Need to handle templates created on-the-fly
4. **Vue reactivity overwrites changes** - Simple find/replace gets overwritten

**Solution:** Use **MutationObserver** to watch DOM changes in real-time!

---

## The Solution Architecture

### Three-Part System:

```
┌─────────────────────────────────────────────────────┐
│  PART 1: Auto-Create FSE Templates                  │
│  (PHP - runs on page load)                          │
├─────────────────────────────────────────────────────┤
│  1. Hook into Voxel's admin screens                 │
│  2. Get all template types (single, card, form...)  │
│  3. Create wp_template posts for each               │
│  4. Build URL mapping: Elementor ID → FSE URL       │
│  5. Store in PHP global variable                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  PART 2: Inject JavaScript Override                 │
│  (PHP outputs inline script)                        │
├─────────────────────────────────────────────────────┤
│  1. Output <script> in admin_footer                 │
│  2. Pass URL mapping to JavaScript                  │
│  3. Setup MutationObserver                          │
│  4. Setup AJAX interception                         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  PART 3: Watch & Replace Links                      │
│  (JavaScript - runs in browser)                     │
├─────────────────────────────────────────────────────┤
│  1. MutationObserver watches DOM                    │
│  2. Vue adds/updates template buttons               │
│  3. Observer detects changes                        │
│  4. Replace Elementor URLs with FSE URLs            │
│  5. AJAX intercept adds new templates to mapping    │
└─────────────────────────────────────────────────────┘
```

---

## How MutationObserver Works

### What is MutationObserver?

**MutationObserver** is a browser API that watches for changes to the DOM tree and triggers a callback when changes occur.

**Use Case:** Perfect for watching Vue.js apps that modify the DOM after initial page load.

---

### Basic MutationObserver Pattern:

```javascript
// 1. Create observer with callback function
var observer = new MutationObserver(function(mutations) {
    // This runs whenever DOM changes occur
    mutations.forEach(function(mutation) {
        console.log('DOM changed!', mutation);
    });
});

// 2. Configure what to watch
var config = {
    childList: true,      // Watch for added/removed child nodes
    subtree: true,        // Watch all descendants (not just direct children)
    attributes: true,     // Watch for attribute changes
    attributeFilter: ['href']  // Only watch href attribute changes
};

// 3. Start observing a DOM element
var targetElement = document.getElementById('vx-template-manager');
observer.observe(targetElement, config);

// 4. Stop observing when needed
observer.disconnect();
```

---

### Our Implementation:

**File:** `design-menu-integration.php:260-293`

```javascript
// Watch for DOM changes and replace links as Vue adds/updates them
var observer = new MutationObserver(function(mutations) {
    var shouldReplace = false;

    mutations.forEach(function(mutation) {
        // Check if nodes were added (Vue rendered new templates)
        if (mutation.addedNodes.length > 0) {
            shouldReplace = true;
        }

        // Check if attributes changed (Vue updated href)
        if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
            shouldReplace = true;
        }
    });

    if (shouldReplace) {
        console.log('FSE Design Menu: DOM mutation detected, replacing edit links...');
        replaceEditLinks();  // ⭐ Replace Elementor URLs with FSE URLs
    }
});

// Start observing the template manager container
var templateManager = document.getElementById('vx-template-manager');
if (templateManager) {
    observer.observe(templateManager, {
        childList: true,       // Watch for added/removed nodes
        subtree: true,         // Watch all descendants
        attributes: true,      // Watch for attribute changes
        attributeFilter: ['href']  // Only watch href attribute changes
    });
    console.log('FSE Design Menu: MutationObserver started');
}
```

---

### What It Watches:

**1. childList: true** - Detects when Vue adds new template buttons:
```html
<!-- Before: Empty container -->
<div id="vx-template-manager"></div>

<!-- After: Vue adds buttons (MutationObserver fires!) -->
<div id="vx-template-manager">
    <a href="/wp-admin/post.php?post=123&action=elementor">Edit Template</a>
</div>
```

**2. subtree: true** - Watches nested elements:
```html
<div id="vx-template-manager">  <!-- Observe this -->
    <div class="template-list">  <!-- AND this -->
        <div class="template-item">  <!-- AND this -->
            <a href="...">Edit</a>  <!-- AND this! -->
        </div>
    </div>
</div>
```

**3. attributes: true, attributeFilter: ['href']** - Detects href changes:
```javascript
// Vue changes href (MutationObserver fires!)
button.setAttribute('href', '/wp-admin/post.php?post=456&action=elementor');
```

---

### The Replacement Function:

**File:** `design-menu-integration.php:218-251`

```javascript
function replaceEditLinks(container) {
    if (!container) {
        container = document;  // Search entire page if no container specified
    }

    // Find all "Edit template" buttons with Elementor URLs
    var editButtons = container.querySelectorAll('a[href*="post.php"][href*="action=elementor"]');
    var replacedCount = 0;

    editButtons.forEach(function(button) {
        var currentHref = button.getAttribute('href');
        if (!currentHref) return;

        // Extract template ID from Elementor URL
        // URL: /wp-admin/post.php?post=123&action=elementor
        // Extract: 123
        var templateId = extractTemplateIdFromUrl(currentHref);
        if (!templateId) return;

        // Check if we have an FSE URL for this template
        var fseUrl = fseTemplateUrls[templateId] || fseTemplateUrls[String(templateId)];

        if (fseUrl) {
            console.log('Replacing Elementor URL with FSE URL for template', templateId);
            console.log('  Old:', currentHref);
            console.log('  New:', fseUrl);

            // ⭐ THIS IS THE KEY - Replace href attribute
            button.setAttribute('href', fseUrl);
            replacedCount++;
        }
    });

    if (replacedCount > 0) {
        console.log('Replaced', replacedCount, 'edit links');
    }

    return replacedCount;
}
```

---

### Extract Template ID from URL:

```javascript
/**
 * Extract template ID from Elementor URL
 * URL format: http://...post.php?post=123&action=elementor
 */
function extractTemplateIdFromUrl(url) {
    // Regular expression to find "post=123"
    var match = url.match(/[?&]post=(\d+)/);
    return match ? match[1] : null;  // Returns "123" or null
}
```

**Example:**
```javascript
extractTemplateIdFromUrl('/wp-admin/post.php?post=456&action=elementor');
// Returns: "456"

extractTemplateIdFromUrl('/wp-admin/site-editor.php?postId=voxel-fse//template');
// Returns: null (no match)
```

---

## Complete Flow Diagram

### Scenario: User Opens Post Types Admin Page

```
┌──────────────────────────────────────────────────┐
│  1. USER NAVIGATES                               │
│  /wp-admin/edit.php?page=edit-post-type-places  │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  2. PHP HOOKS EXECUTE (Priority 29)             │
│  File: vue-integration.php:34                    │
├──────────────────────────────────────────────────┤
│  • Hook: voxel/backend/post-types/screen:edit-type│
│  • Extract post type key: "places"              │
│  • Get Voxel templates: { single: 123, form: 456 }│
│                                                  │
│  Create FSE templates:                           │
│  • create_fse_template('places', 'single')       │
│    → Creates wp_template post                   │
│    → Slug: "voxel-places-single"                │
│    → ID: 789                                     │
│                                                  │
│  • create_fse_template('places', 'form')         │
│    → Slug: "voxel-places-form"                  │
│    → ID: 790                                     │
│                                                  │
│  Build URL mapping:                              │
│  fseTemplateUrls = {                            │
│    "789": "/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-single",│
│    "790": "/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-form"│
│  }                                               │
│                                                  │
│  Store in global variable:                       │
│  $mw_fse_template_urls = [...]                  │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  3. VOXEL RENDERS PAGE (Priority 30)            │
│  File: Voxel's post-type-controller.php         │
├──────────────────────────────────────────────────┤
│  Voxel outputs:                                  │
│  window.Post_Type_Config = {                    │
│    templates: {                                  │
│      single: 789,  // FSE template ID (we overwrote it!)│
│      form: 790                                   │
│    }                                             │
│  };                                              │
│                                                  │
│  Vue renders template buttons with Elementor URLs│
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  4. INJECT JAVASCRIPT (admin_footer)             │
│  File: vue-integration.php:127-362               │
├──────────────────────────────────────────────────┤
│  <script type="text/javascript">                │
│  var fseTemplateUrls = {                        │
│    "789": "/wp-admin/site-editor.php?...",      │
│    "790": "/wp-admin/site-editor.php?..."       │
│  };                                              │
│                                                  │
│  // Setup MutationObserver                       │
│  var observer = new MutationObserver(...);      │
│  observer.observe(document.getElementById('vx-template-manager'));│
│                                                  │
│  // Initial replacement after delay             │
│  setTimeout(replaceEditLinks, 500);             │
│  </script>                                       │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  5. VUE.JS RENDERS TEMPLATES                     │
│  (After page load, ~200-500ms)                   │
├──────────────────────────────────────────────────┤
│  Vue adds to DOM:                                │
│  <div id="vx-template-manager">                 │
│    <a href="/wp-admin/post.php?post=789&action=elementor">│
│      Edit Single Template                        │
│    </a>                                          │
│    <a href="/wp-admin/post.php?post=790&action=elementor">│
│      Edit Form Template                          │
│    </a>                                          │
│  </div>                                          │
│                                                  │
│  ⭐ MutationObserver detects: childList mutation! │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  6. MUTATIONOBSERVER CALLBACK FIRES              │
│  File: design-menu-integration.php:260-279       │
├──────────────────────────────────────────────────┤
│  observer callback:                              │
│    mutations.forEach(mutation => {              │
│      if (mutation.addedNodes.length > 0) {      │
│        shouldReplace = true;  // Vue added nodes!│
│      }                                           │
│    });                                           │
│                                                  │
│    if (shouldReplace) {                          │
│      replaceEditLinks();  // ⭐ Replace URLs!   │
│    }                                             │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  7. REPLACE LINKS FUNCTION                       │
│  File: design-menu-integration.php:218-251       │
├──────────────────────────────────────────────────┤
│  Find all Elementor links:                       │
│  querySelectorAll('a[href*="action=elementor"]') │
│                                                  │
│  For each link:                                  │
│    • Extract template ID from URL: "789"        │
│    • Look up FSE URL: fseTemplateUrls["789"]    │
│    • Replace href:                               │
│      OLD: /wp-admin/post.php?post=789&action=elementor│
│      NEW: /wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-single│
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  8. USER SEES FSE LINKS                          │
│  (No page reload needed!)                        │
├──────────────────────────────────────────────────┤
│  DOM now has:                                    │
│  <div id="vx-template-manager">                 │
│    <a href="/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-single">│
│      Edit Single Template  ✅                    │
│    </a>                                          │
│    <a href="/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-form">│
│      Edit Form Template  ✅                      │
│    </a>                                          │
│  </div>                                          │
│                                                  │
│  User clicks → Opens Site Editor!                │
└──────────────────────────────────────────────────┘
```

---

## Implementation Details

### Part 1: Auto-Create FSE Templates

**File:** `app/controllers/fse-templates/vue-integration.php:34-120`

```php
add_action( 'voxel/backend/post-types/screen:edit-type', function() {
    // Extract post type key from URL
    $page = $_GET['page'] ?? '';
    $key = str_replace( 'edit-post-type-', '', $page );
    $post_type = \Voxel\Post_Type::get( $key );

    // Template types to create
    $template_types = [ 'single', 'card', 'archive', 'form' ];
    $fse_template_ids = [];

    foreach ( $template_types as $template_type ) {
        // Create FSE template (wp_template post)
        $template_id = Template_Manager::create_fse_template( $key, $template_type );

        if ( $template_id ) {
            $fse_template_ids[ $template_type ] = $template_id;

            // Save to Voxel's config (overrides Elementor IDs!)
            $template = get_post( $template_id );
            Template_Manager::save_template_to_config(
                $post_type,
                $template_type,
                $template->post_name  // "voxel-places-form"
            );
        }
    }

    // Build Site Editor URLs
    $fse_template_urls = [];
    foreach ( $fse_template_ids as $template_type => $template_id ) {
        $fse_template_urls[ $template_id ] = Template_Manager::get_site_editor_url( $template_id );
    }

    // Store in global for JavaScript
    global $mw_fse_template_urls;
    $mw_fse_template_urls = $fse_template_urls;
}, 29 );  // ⭐ Priority 29 - BEFORE Voxel renders (priority 30)
```

**Key:** Runs at **priority 29** - before Voxel's render (priority 30)

---

### Part 2: Inject JavaScript Override

**File:** `app/controllers/fse-templates/vue-integration.php:127-362`

```php
add_action( 'voxel/backend/post-types/screen:edit-type', function() {
    global $mw_fse_template_urls;

    if ( empty( $mw_fse_template_urls ) ) {
        return;
    }

    ?>
    <script type="text/javascript">
    (function() {
        console.log('FSE Templates: Installing DOM mutation observer...');

        // URL mapping from PHP
        var fseTemplateUrls = <?php echo wp_json_encode( $mw_fse_template_urls, JSON_FORCE_OBJECT ); ?>;

        // ... MutationObserver setup (see below)
        // ... replaceEditLinks function
        // ... AJAX interception

        console.log('FSE Templates: Setup complete');
    })();
    </script>
    <?php
}, 31 );  // ⭐ Priority 31 - AFTER Voxel outputs Post_Type_Config (priority 30)
```

**Key:** Runs at **priority 31** - after Voxel outputs JavaScript globals

---

### Part 3: MutationObserver Setup

```javascript
// Initial replacement after short delay for Vue to render
setTimeout(function() {
    console.log('Running initial href replacement...');
    replaceEditLinks();
}, 500);

// Create observer
var observer = new MutationObserver(function(mutations) {
    var shouldReplace = false;

    mutations.forEach(function(mutation) {
        // Check if nodes were added (Vue rendered templates)
        if (mutation.addedNodes.length > 0) {
            shouldReplace = true;
        }

        // Check if href attribute changed (Vue updated link)
        if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
            shouldReplace = true;
        }
    });

    if (shouldReplace) {
        console.log('DOM mutation detected, replacing edit links...');
        replaceEditLinks();
    }
});

// Start observing
var templateManager = document.querySelector('.ts-form');  // Voxel's form container
if (templateManager) {
    observer.observe(templateManager, {
        childList: true,       // Watch for added/removed nodes
        subtree: true,         // Watch all descendants
        attributes: true,      // Watch for attribute changes
        attributeFilter: ['href']  // Only watch href changes
    });
    console.log('MutationObserver started on .ts-form');
}
```

---

### Part 4: AJAX Interception (Bonus)

**When user creates NEW template via AJAX:**

```javascript
// Intercept AJAX responses
var originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function() {
    var xhr = this;

    this.addEventListener('load', function() {
        // Check for template creation AJAX
        if (xhr._url && xhr._url.indexOf('backend.create_custom_template') !== -1) {
            console.log('Detected template creation AJAX');

            try {
                var response = JSON.parse(xhr.responseText);

                // Response includes FSE template info from PHP
                if (response.success && response.fse_template_id && response.fse_edit_url) {
                    // Add to mapping immediately
                    fseTemplateUrls[response.fse_template_id] = response.fse_edit_url;

                    // Wait for Vue to render, then replace links
                    setTimeout(function() {
                        replaceEditLinks();
                    }, 100);
                }
            } catch (e) {
                console.error('Error parsing AJAX response:', e);
            }
        }
    });

    return originalXHRSend.apply(this, arguments);
};
```

**This ensures newly created templates also get FSE URLs!**

---

## Summary

### How It Works:

**1. FSE Template Creation (PHP)**
- WordPress creates `wp_template` posts
- Template slug format: `voxel-{post-type}-{type}`
- Stored in `wp_posts` table with `post_type='wp_template'`

**2. URL Mapping (PHP → JavaScript)**
```php
// PHP builds mapping
$fse_template_urls = [
    '789' => '/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-single',
    '790' => '/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-form',
];

// Pass to JavaScript
var fseTemplateUrls = <?php echo wp_json_encode($fse_template_urls); ?>;
```

**3. MutationObserver (JavaScript)**
- Watches `#vx-template-manager` or `.ts-form` container
- Detects when Vue adds/updates template buttons
- Triggers `replaceEditLinks()` function

**4. Link Replacement (JavaScript)**
```javascript
// Find: <a href="/wp-admin/post.php?post=789&action=elementor">
// Extract: 789
// Lookup: fseTemplateUrls["789"]
// Replace: setAttribute('href', FSE_URL)
```

**5. Result:**
- User clicks "Edit Template"
- Opens `/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-places-single`
- Site Editor loads with FSE template
- **No Elementor!** ✅

---

### Key Files:

1. **`vue-integration.php`** - Post Types admin integration
2. **`design-menu-integration.php`** - Design menu integration
3. **`template-manager.php`** - Creates wp_template posts
4. **`templates-controller.php`** - Registers templates with WordPress

### Git Commits:

- **45d4b848** - "Replace Vue reactivity with MutationObserver for Post Types"
- **fcd993e5** - "Add DOM manipulation to force button href update"
- **40342945** - "Force Vue re-render after AJAX template creation"

---

**The "magic" is MutationObserver - it watches Vue.js DOM changes in real-time and replaces Elementor URLs with FSE Site Editor URLs instantly, with no page reload needed!**