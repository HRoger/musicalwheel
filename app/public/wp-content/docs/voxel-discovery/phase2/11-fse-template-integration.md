# FSE Template Integration for Voxel Design Menu

**Date:** November 17, 2025
**Version:** 1.0.6
**Status:** ✅ Completed

---

## 🎯 Overview

This document explains the implementation of FSE (Full Site Editing) template integration for Voxel's Design menu pages, replacing Elementor template edit links with WordPress Site Editor links.

---

## 📋 Problem Statement

### Original Issue

Voxel's Design menu (General, Header & Footer, Taxonomies) had "Edit template" buttons that opened templates in Elementor. The goal was to redirect these buttons to open FSE templates in WordPress Site Editor instead.

### Challenge

The previous implementation attempted to modify Vue's configuration **after** the component had already mounted, which failed because:

1. Vue reads `dataset.config` at mount time via `JSON.parse()`
2. The parsed config is stored in Vue's reactive `this.config` object
3. Modifying the dataset attribute after mount has no effect on the running instance

**Evidence:**
```javascript
// Vue mount process (template-manager.js)
var config = JSON.parse(i.dataset.config);  // ← Parsed at mount
Vue.createApp({
    data() {
        return { config: config, ... }  // ← Config stored
    },
    methods: {
        editLink(id) {
            return this.config.editLink.replace("{id}", id);  // ← Uses stored config
        }
    }
}).mount(i);
```

---

## ✅ Solution

### Approach

**Intercept `JSON.parse()` BEFORE Vue calls it** to modify the config object during parsing.

### Technical Implementation

1. **Timing**: Use `wp_add_inline_script()` with `'before'` parameter to inject code before `vx:template-manager.js` executes
2. **Interception**: Override `JSON.parse()` globally to catch Vue's config parsing
3. **Detection**: Identify template manager config by checking for `editLink` property containing "post.php"
4. **Override**: Use `Object.defineProperty()` to replace `editLink` with custom object containing FSE URL mapping
5. **Cleanup**: Restore original `JSON.parse()` after 1 second to avoid side effects

### Code Flow

```
1. Page loads
2. Our inline script runs (overrides JSON.parse)
3. template-manager.js loads
4. Vue calls JSON.parse(dataset.config)
5. Our override intercepts and modifies config
6. Vue uses modified config with FSE URLs
7. Original JSON.parse restored after 1s
```

---

## 📁 Files Modified

### Primary File

**`plugins/musicalwheel-core/modules/fse-templates/design-menu-integration.php`**

**Changes:**
- Replaced `admin_head` hook with `admin_enqueue_scripts`
- Changed from DOM manipulation to `JSON.parse()` interception
- Added `wp_add_inline_script()` to inject before template-manager.js
- Improved AJAX interception for dynamic template creation

**Key Functions:**
1. `admin_init` hook (priority 5) - Creates FSE templates and builds URL mapping
2. `admin_enqueue_scripts` hook (priority 100) - Injects JavaScript override

---

## 🔍 How It Works

### Step 1: Create FSE Templates

```php
add_action( 'admin_init', function() {
    // Get all base templates from Voxel
    $base_templates = \Voxel\get_base_templates();
    $fse_template_urls = [];

    foreach ( $base_templates as $template ) {
        // Create FSE template
        $fse_template_id = Template_Manager::create_fse_template_for_design_menu(
            $template_type,
            $template['label']
        );

        // Map Elementor ID → FSE Site Editor URL
        $fse_template_urls[ $template['id'] ] = Template_Manager::get_site_editor_url( $fse_template_id );
    }
}, 5 );
```

### Step 2: Inject JavaScript Override

```php
add_action( 'admin_enqueue_scripts', function() {
    $inline_script = "
    (function() {
        var originalJSONParse = JSON.parse;
        var fseTemplateUrls = %s;  // PHP injects mapping

        JSON.parse = function(text, reviver) {
            var result = originalJSONParse.call(this, text, reviver);

            // Detect Vue config
            if (result && result.editLink && result.editLink.indexOf('post.php') !== -1) {
                var originalEditLink = result.editLink;

                // Override editLink property
                Object.defineProperty(result, 'editLink', {
                    get: function() {
                        return {
                            replace: function(placeholder, templateId) {
                                // Return FSE URL if mapped, else Elementor URL
                                return fseTemplateUrls[templateId] ||
                                       originalEditLink.replace(placeholder, templateId);
                            }
                        };
                    }
                });
            }

            return result;
        };
    })();
    ";

    wp_add_inline_script( 'vx:template-manager.js', $inline_script, 'before' );
}, 100 );
```

### Step 3: AJAX Interception

The script also intercepts AJAX responses to dynamically add newly created templates to the mapping:

```javascript
XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
        if (xhr._url.indexOf('backend.create_custom_template') !== -1) {
            var response = JSON.parse(xhr.responseText);
            if (response.fse_template_id && response.fse_edit_url) {
                fseTemplateUrls[response.fse_template_id] = response.fse_edit_url;
            }
        }
    });
};
```

---

## 🌐 Pages Affected

All three Design menu pages now use FSE Site Editor:

### 1. General (`/wp-admin/admin.php?page=voxel-templates`)
**Tabs:**
- Membership (Login & registration, Current plan)
- Orders
- Social (Newsfeed, Inbox)
- Other (Post statistics, Privacy Policy, Terms & Conditions, 404, Restricted content)
- Style kits (Popup styles, Timeline styles)

### 2. Header & Footer (`/wp-admin/admin.php?page=vx-templates-header-footer`)
**Tabs:**
- Header
- Footer

**Features:**
- Base template editing
- Custom template creation
- Conditional template rules
- Drag & drop ordering

### 3. Taxonomies (`/wp-admin/admin.php?page=vx-templates-taxonomies`)
**Tabs:**
- Single term
- Preview card

**Features:**
- Custom template creation
- Conditional template rules (for single terms)
- Drag & drop ordering

---

## 🧪 Testing Instructions

### Automated Testing (Browser Console)

1. Navigate to any Design menu page
2. Open Browser Developer Tools (F12)
3. Go to **Console** tab
4. Look for these messages:

```
✅ FSE Design Menu: Installing editLink override (inline script approach)...
✅ FSE Design Menu: Intercepted Vue config: {editLink: "...", ...}
✅ FSE Design Menu: editLink override installed via JSON.parse intercept
✅ FSE Design Menu: Restored original JSON.parse
✅ FSE Design Menu: AJAX interceptor installed
```

### Manual Testing

#### Test 1: Edit Existing Template
1. Go to **Design → General** (`/wp-admin/admin.php?page=voxel-templates`)
2. Click any "Edit template" button
3. **Console should show:**
   ```
   FSE Design Menu: editLink.replace called with templateId: 123
   FSE Design Menu: Returning FSE URL: /wp-admin/site-editor.php?...
   ```
4. **Browser should navigate to:** WordPress Site Editor (not Elementor)

#### Test 2: Create New Template
1. Go to **Design → Header & Footer**
2. Click "+ Create template"
3. Enter template name and save
4. Click "Edit template" on the new template
5. **Should open:** WordPress Site Editor

#### Test 3: Custom Templates with Conditions
1. Go to **Design → Taxonomies**
2. Click "+"Create template"
3. After creation, click the branch icon (🔀) to set conditions
4. Click "Edit template"
5. **Should open:** WordPress Site Editor

### Visual Verification

**Icons Should Be Visible:**
- 🔒 Lock icon (base templates)
- ⋮ Ellipsis icon (settings)
- 👁 Eye icon (preview)
- 🗑 Trash icon (delete)
- 🔀 Branch icon (conditions)
- ≡ Grip icon (drag handle)

---

## 🔧 Debugging

### Common Issues

#### Issue 1: Icons Not Showing
**Cause:** Line Awesome CSS not loaded
**Solution:** Verify Voxel's CSS is loading properly (icons are not affected by our code)

#### Issue 2: Edit Links Still Opening Elementor
**Symptoms:**
- Console shows no "FSE Design Menu" messages
- Clicking "Edit template" opens Elementor

**Debug Steps:**
1. Check if `vx:template-manager.js` is enqueued:
   ```javascript
   // In console
   console.log(wp.hooks);
   ```

2. Verify inline script is injected:
   ```javascript
   // View page source, search for "FSE Design Menu"
   ```

3. Check for JavaScript errors:
   ```javascript
   // Console → look for red error messages
   ```

#### Issue 3: FSE URLs Not Generated
**Symptoms:**
- Console shows "Using original Elementor URL"

**Debug Steps:**
1. Check FSE template creation:
   ```php
   // In admin_init hook
   error_log(print_r($fse_template_urls, true));
   ```

2. Verify template IDs match:
   ```javascript
   // In console
   console.log(fseTemplateUrls);
   ```

### Debug Mode

Enable detailed logging by uncommenting debug lines in the code:

```javascript
// Add to inline script
console.log('Config detected:', result);
console.log('Original editLink:', originalEditLink);
console.log('FSE mapping:', fseTemplateUrls);
```

---

## 📊 Technical Comparison

### Previous Implementation (Failed)

```javascript
// Ran in admin_head at priority 1000
function installOverride() {
    var vmElement = document.getElementById('vx-template-manager');
    var vxConfig = JSON.parse(vmElement.dataset.config);  // ← Vue already mounted!

    Object.defineProperty(vxConfig, 'editLink', { /* override */ });
    vmElement.dataset.config = JSON.stringify(vxConfig);  // ← Too late!
}
```

**Why it failed:** Vue had already parsed and stored the config.

### New Implementation (Working)

```javascript
// Runs BEFORE template-manager.js
JSON.parse = function(text, reviver) {  // ← Intercept at parse time
    var result = originalJSONParse.call(this, text, reviver);
    if (/* is Vue config */) {
        Object.defineProperty(result, 'editLink', { /* override */ });  // ← Modify before Vue uses it
    }
    return result;
};
```

**Why it works:** We modify the config object AS Vue parses it.

---

## 🎓 Key Learnings

### Vue.js Lifecycle

1. **Mount Process:**
   ```
   Parse data-config → Store in this.config → Mount component → Render
   ```

2. **Interception Points:**
   - ✅ **Before parse:** Override JSON.parse
   - ❌ **After mount:** Too late to modify reactive data

### WordPress Hooks

- `admin_init` (priority 5): Early data preparation
- `admin_enqueue_scripts` (priority 100): Script injection
- `wp_add_inline_script($handle, $script, 'before')`: Run before target script

### Object.defineProperty

Using a getter allows us to return a dynamic object:

```javascript
Object.defineProperty(config, 'editLink', {
    get: function() {
        return {
            replace: function(placeholder, id) {
                return fseTemplateUrls[id] || fallbackURL;
            }
        };
    }
});
```

This works because Vue calls `this.config.editLink.replace("{id}", id)` each time, triggering our getter.

---

## 📝 Git History

### Commits

**Latest Commit:**
```
d30b5c2 - Fix: FSE template integration for Design menu pages

- Replaced admin_head with admin_enqueue_scripts hook
- Switched to JSON.parse() interception approach
- Added wp_add_inline_script() for proper timing
- Improved AJAX interception for dynamic templates
```

**Branch:** `claude/voxel-fse-templates-0196Y9pUzkDh6WqvK8B6nTT2-01FLs3ChveEsz4rAbqb1AHyX`

### File Changes
```
plugins/musicalwheel-core/modules/fse-templates/design-menu-integration.php
    88 insertions(+), 93 deletions(-)
```

---

## ✅ Checklist

- [x] FSE templates auto-created for all base templates
- [x] Edit links redirect to Site Editor (General page)
- [x] Edit links redirect to Site Editor (Header & Footer page)
- [x] Edit links redirect to Site Editor (Taxonomies page)
- [x] Icons display correctly
- [x] Custom template creation works
- [x] AJAX template creation adds to mapping
- [x] Fallback to Elementor for unmapped templates
- [x] Code documented with inline comments
- [x] Console logging for debugging
- [x] No JavaScript errors
- [x] No CSS conflicts
- [x] Committed to git
- [x] Pushed to remote

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Performance:** Cache FSE template URLs in transients
2. **UI Feedback:** Add visual indicator showing FSE vs Elementor templates
3. **Admin Notice:** Show success message when FSE templates are created
4. **Settings Page:** Allow admins to toggle FSE integration on/off
5. **Bulk Actions:** Convert all Elementor templates to FSE at once

### Compatibility

- **WordPress:** 6.4+
- **Voxel:** Latest version
- **PHP:** 7.4+
- **Browser:** Chrome, Firefox, Safari, Edge (modern versions)

---

## 📧 Support

For issues or questions:
1. Check console for error messages
2. Verify FSE templates exist in Site Editor
3. Test with browser cache cleared
4. Check PHP error logs
5. Review git commit history for recent changes

---

**Document Version:** 1.0
**Last Updated:** November 17, 2025
**Author:** Claude (AI Assistant)
