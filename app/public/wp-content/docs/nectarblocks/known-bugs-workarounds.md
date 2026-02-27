# NectarBlocks — Known Bugs & Workarounds

## Bug 1: `post_content` read on null `$post` on taxonomy/archive pages

**Date:** 2026-02-27
**File:** `wp-content/plugins/nectar-blocks/includes/Render/Render.php:668`
**Error:** `Warning: Attempt to read property "post_content" on null`

### Root Cause

`Render::frontend_render_styles()` fires on `wp_enqueue_scripts` at priority 99.
It does `global $post` at the top, then at line 668 accesses `$post->post_content`
**without any null check**.

On taxonomy/category archive pages, WordPress's global `$post` is `null` at enqueue
time because there is no "current post" on term pages.

### Workaround

Set `$post` to a stub object at priority 98 (before NectarBlocks at 99).
See Bug 2 below for the combined workaround code.

---

## Bug 2: `wp_id` read on null `$block_template` in PHP templates

**Date:** 2026-02-27
**File:** `wp-content/plugins/nectar-blocks/includes/Render/Render.php:744`
**Error:** `Warning: Attempt to read property "wp_id" on null`

### Root Cause

At line 741, NectarBlocks checks `wp_is_block_theme()` and then calls:
```php
global $_wp_current_template_id;
$block_template = get_block_template($_wp_current_template_id, 'wp_template');
$post_id = $block_template->wp_id;  // line 744 — no null check
```

When a PHP template file (like `taxonomy.php`) handles the request instead of the
block template hierarchy, `$_wp_current_template_id` is unset. This causes
`get_block_template(null)` to return `null`, and `->wp_id` fails.

### Workaround

Set `$_wp_current_template_id` to the theme's index template at priority 98.

---

## Combined Workaround (taxonomy.php)

**File:** `themes/voxel-fse/taxonomy.php`

**Critical:** Must be registered **before any `get_header()` call**, including
early-return error paths.

```php
add_action( 'wp_enqueue_scripts', function() {
    global $post, $_wp_current_template_id;
    if ( $post === null ) {
        $post = (object) [ 'ID' => 0, 'post_content' => '' ];
    }
    if ( empty( $_wp_current_template_id ) ) {
        $_wp_current_template_id = get_stylesheet() . '//index';
    }
}, 98 );
```

### Notes

- Both are **NectarBlocks plugin bugs**. The fixes should be:
  - Bug 1: `if ( $post )` guard around line 668
  - Bug 2: `if ( $block_template )` guard around line 744
- If NectarBlocks is updated, check whether these are fixed and remove workarounds.
- The workaround applies to any PHP template in the FSE theme (taxonomy.php,
  author.php, etc.) that bypasses WordPress's block template hierarchy.
