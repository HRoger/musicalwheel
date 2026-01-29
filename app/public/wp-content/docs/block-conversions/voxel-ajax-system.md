# Voxel Custom AJAX System

**Discovered:** 2025-12-01 during PostRelationField implementation
**Location:** `themes/voxel/app/controllers/ajax-controller.php`
**Type:** Custom AJAX handler (NOT standard WordPress admin-ajax.php)

---

## Overview

Voxel implements a **custom AJAX system** that differs significantly from WordPress's standard `admin-ajax.php` approach. This system provides better performance and custom routing for all Voxel AJAX endpoints.

**Key difference:** Voxel hooks into `template_redirect`, NOT the standard `wp_ajax_*` or `wp_ajax_nopriv_*` hooks.

---

## How It Works

### 1. Request Trigger

Requests must include the `vx=1` parameter to trigger Voxel's AJAX handler:

```
http://site.com/?vx=1&action=create_post.relations.get_posts&post_type=places
```

**Evidence:** `ajax-controller.php:23`
```php
if ( empty( $_GET['vx'] ) ) {
    return;
}
```

### 2. Hook Registration

Ajax_Controller hooks into `template_redirect`, which fires during WordPress's main query:

**Evidence:** `ajax-controller.php:18-19`
```php
protected function hooks() {
    $this->on( 'template_redirect', '@do_ajax', 0 );
}
```

### 3. Action Processing

The controller reads the `action` parameter and **automatically adds** the `voxel_ajax_` prefix:

**Evidence:** `ajax-controller.php:68-78`
```php
$action = $wp_query->get( 'vx-action' );

if ( is_user_logged_in() ) {
    if ( ! has_action( "voxel_ajax_{$action}" ) ) {
        wp_die();
    }
    do_action( "voxel_ajax_{$action}" );
} else {
    // Handle nopriv actions
    if ( ! has_action( "voxel_ajax_nopriv_{$action}" ) ) {
        wp_die();
    }
    do_action( "voxel_ajax_nopriv_{$action}" );
}
```

### 4. Action Registration

Controllers register actions with the `voxel_ajax_` prefix already included:

**Example:** `post-relations-controller.php:12`
```php
protected function hooks() {
    $this->on( 'voxel_ajax_create_post.relations.get_posts', '@get_posts_for_relation_field' );
}
```

---

## Correct vs Wrong Implementation

### ✅ CORRECT

**URL Format:**
```
http://site.com/?vx=1&action=create_post.relations.get_posts
```

**JavaScript:**
```typescript
const ajaxUrl = window.voxel_config?.home_url || window.location.origin;
const params = new URLSearchParams({
    action: 'create_post.relations.get_posts', // NO voxel_ajax_ prefix!
    post_type: 'places',
    field_key: 'post-relation',
    offset: '0'
});
const url = `${ajaxUrl}/?vx=1&${params.toString()}`;
```

**Flow:**
1. Request goes to site URL with `?vx=1`
2. `template_redirect` hook fires
3. Ajax_Controller runs
4. Adds `voxel_ajax_` prefix to action
5. Calls `do_action('voxel_ajax_create_post.relations.get_posts')`
6. Matches registered action ✅

### ❌ WRONG

**URL Format:**
```
http://site.com/wp-admin/admin-ajax.php?vx=1&action=create_post.relations.get_posts
```

**Why it fails:**
1. Request goes to `/wp-admin/admin-ajax.php`
2. WordPress's admin-ajax.php handler takes over **BEFORE** `template_redirect` fires
3. Ajax_Controller never runs
4. Action not found, returns `'0'` ❌

**Also wrong:**
```typescript
action: 'voxel_ajax_create_post.relations.get_posts' // Double prefix!
```

This creates `voxel_ajax_voxel_ajax_create_post.relations.get_posts` (double prefix) which won't match any registered action.

---

## Implementation in FSE Child Theme

### Example: PostRelationField.tsx

**Location:** `app/blocks/src/create-post/components/fields/PostRelationField.tsx:153-174`

```typescript
// Build query parameters
const params = new URLSearchParams({
    action: 'create_post.relations.get_posts', // NO prefix!
    post_type: postTypeKey || '',
    field_key: field.key,
    offset: offset.toString(),
});

// Use site URL, NOT admin-ajax.php
const ajaxUrl = (window as any).voxel_config?.home_url || window.location.origin;
const url = `${ajaxUrl}/?vx=1&${params.toString()}`;

const response = await fetch(url);
const data = await response.json();
```

---

## Key Features

### Performance

**Benefit:** Custom endpoint is faster than `admin-ajax.php`
**Evidence:** `ajax-controller.php:12` comments reference performance improvements

### Security

**Logged-in users:**
```php
if ( is_user_logged_in() ) {
    if ( ! has_action( "voxel_ajax_{$action}" ) ) {
        wp_die();
    }
    do_action( "voxel_ajax_{$action}" );
}
```

**Non-logged-in users:**
```php
if ( ! has_action( "voxel_ajax_nopriv_{$action}" ) ) {
    wp_die();
}
do_action( "voxel_ajax_nopriv_{$action}" );
```

### Headers

**Evidence:** `ajax-controller.php:51-60`
```php
send_origin_headers();
@header( 'Content-Type: text/html; charset=' . get_option( 'blog_charset' ) );
@header( 'X-Robots-Tag: noindex' );
send_nosniff_header();
nocache_headers();
```

### Session Handling

**Early session close for concurrent requests:**
**Evidence:** `ajax-controller.php:42`
```php
session_write_close();
```

### Error Handling

**Can hide errors in production:**
**Evidence:** `ajax-controller.php:31-39`
```php
if ( ! defined( 'VOXEL_AJAX_HIDE_ERRORS' ) ) {
    define( 'VOXEL_AJAX_HIDE_ERRORS', true );
}

if ( VOXEL_AJAX_HIDE_ERRORS ) {
    @ini_set( 'display_errors', 0 );
    $GLOBALS['wpdb']->hide_errors();
}
```

---

## Common Use Cases

### 1. Post Relations

**Action:** `create_post.relations.get_posts`
**Handler:** `post-relations-controller.php:15-221`
**Parameters:** `post_type`, `field_key`, `offset`, `search`, `exclude`

### 2. Form Submissions

**Action:** Various form submission endpoints
**Pattern:** `create_post.*` actions

### 3. Search

**Action:** Various search endpoints
**Pattern:** Dynamic based on search context

---

## Troubleshooting

### Error: Returns '0'

**Cause:** Action not registered or wrong URL format

**Checklist:**
1. ✅ Is `vx=1` parameter present?
2. ✅ Is URL pointing to site home, NOT admin-ajax.php?
3. ✅ Is action parameter WITHOUT `voxel_ajax_` prefix?
4. ✅ Is user logged in (if required)?
5. ✅ Is action registered in a controller?

### Error: 400 Bad Request

**Cause:** Missing required parameters

**Solution:** Check backend handler to see what parameters are expected

### Error: 403 Forbidden

**Cause:** User not authorized

**Solution:** Check if action requires logged-in user and proper capabilities

---

## Migration from Standard WordPress AJAX

If migrating from standard WordPress AJAX to Voxel's system:

### Before (Standard WordPress):
```javascript
const url = '/wp-admin/admin-ajax.php';
const formData = new FormData();
formData.append('action', 'my_custom_action');
```

### After (Voxel):
```javascript
const ajaxUrl = window.voxel_config?.home_url || window.location.origin;
const params = new URLSearchParams({
    action: 'my_custom_action' // Will become voxel_ajax_my_custom_action
});
const url = `${ajaxUrl}/?vx=1&${params.toString()}`;
```

### Controller Registration:
```php
// Register with voxel_ajax_ prefix
protected function hooks() {
    $this->on( 'voxel_ajax_my_custom_action', '@handle_action' );
}
```

---

## Best Practices

1. **Always use site URL** - Never use `/wp-admin/admin-ajax.php`
2. **Never include voxel_ajax_ prefix in action parameter** - It's added automatically
3. **Include vx=1 parameter** - Required to trigger the handler
4. **Check user authorization** - Use `is_user_logged_in()` and capability checks
5. **Return JSON responses** - Use `wp_send_json()` for consistency
6. **Handle errors gracefully** - Return proper error codes and messages
7. **Add security nonces** - When appropriate for the action

---

## References

- **Ajax Controller:** `themes/voxel/app/controllers/ajax-controller.php`
- **Post Relations Controller:** `themes/voxel/app/controllers/frontend/create-post/post-relations-controller.php`
- **Example Implementation:** `themes/voxel-fse/app/blocks/src/create-post/components/fields/PostRelationField.tsx`
- **Project Memory:** `.mcp-memory/memory.json` (entity: "Voxel Custom AJAX System")

---

## Changelog

- **2025-12-01:** Initial documentation created during PostRelationField implementation
- **Discovery:** Found during debugging of 400 Bad Request errors with `body: '0'` response
- **Resolution:** Changed from admin-ajax.php to site URL with proper action format
