# NectarBlocks — Known Bugs & Workarounds

## Bug: `post_content` read on null `$post` on taxonomy/archive pages

**Date:** 2026-02-27
**File:** `wp-content/plugins/nectar-blocks/includes/Render/Render.php:668`
**Error:** `Warning: Attempt to read property "post_content" on null`

### Root Cause

`Render::frontend_render_styles()` fires on `wp_enqueue_scripts` at priority 99.
It does `global $post` at the top, then at line 668 accesses `$post->post_content`
**without any null check**, even though the `isset($post->ID)` guard at line 647 is
scoped to a separate `if` block above it.

On taxonomy/category archive pages, WordPress's global `$post` is `null` at enqueue
time because the main query loop hasn't run yet (it runs after `get_header()`).

### Workaround

**File:** `themes/voxel-fse/taxonomy.php`

Hook into `wp_enqueue_scripts` at priority **98** (one before NectarBlocks) and set
`$post` from the query if it is null:

```php
add_action( 'wp_enqueue_scripts', function() {
    global $post, $wp_query;
    if ( $post === null ) {
        if ( ! empty( $wp_query->posts ) ) {
            $post = $wp_query->posts[0];
        } else {
            // Empty archive — provide a stub so NectarBlocks doesn't fatal.
            $post = (object) [ 'ID' => 0, 'post_content' => '' ];
        }
    }
}, 98 );
```

### Why a Direct Assignment Before `get_header()` Didn't Work

An earlier attempt set `$GLOBALS['post']` directly before calling `get_header()`.
This was insufficient because WordPress's template loading or query machinery can
reset `$post` back to null between that point and when `wp_enqueue_scripts` fires
inside `wp_head()`. Using the hook at priority 98 guarantees `$post` is set in the
same action pass, immediately before NectarBlocks reads it at priority 99.

### Notes

- This is a **NectarBlocks plugin bug** — the fix should ideally be an `if ( $post )`
  guard around line 668 in `Render.php`. If the plugin is ever updated, check whether
  this has been fixed upstream and remove the workaround if so.
- The workaround only applies to the FSE path in `taxonomy.php`. The Elementor path
  (lines 17–59) is unaffected as Elementor manages its own post context.
