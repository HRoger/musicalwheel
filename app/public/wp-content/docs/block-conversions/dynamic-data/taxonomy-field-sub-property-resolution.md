# Dynamic Data — Taxonomy Field Sub-Property Resolution

**Date:** 2026-02-26
**Branch:** 19-template-sync
**Affects:** `app/dynamic-data/data-groups/Post_Data_Group.php`

---

## Problem

VoxelScript expressions like `@post(amenities.icon)` or `@post(categories.label)` returned an **empty string** from the dynamic-data render REST API. This caused:

- No icon rendered in the editor canvas for Advanced List items with dynamic icons
- No text rendered for any block using taxonomy sub-properties as dynamic tags

---

## Root Cause

`Post_Data_Group::resolve_voxel_field()` is the default handler for any post field that isn't a built-in property (`:title`, `:id`, etc.). It correctly handled:

- ✅ File/image sub-properties (`gallery.ids`, `logo.url`, `cover_image.id`, etc.)
- ✅ Product field addons (`product.addon_key.price`)
- ❌ **Taxonomy field sub-properties** — not handled at all

When `@post(amenities.icon)` was resolved, the path was:

1. `resolve_property(['amenities', 'icon'])` — not a built-in property → falls to `resolve_voxel_field()`
2. `resolve_voxel_field('amenities', ['icon'])` — two existing handlers both returned `null`
3. Fell through to `get_post_meta($post_id, 'amenities', true)` → empty string (Voxel taxonomy fields don't store data in post meta; they use WordPress term relationships)
4. `.icon` sub-property case not reached → returns `''`

---

## How Voxel Taxonomy Fields Work

Voxel taxonomy fields (e.g. `amenities`, `categories`, `features`) are **not stored in post meta**. They use WordPress's native term relationship system:

- **Store:** `wp_term_relationships` table — terms are assigned via `wp_set_object_terms()`
- **Read:** `get_the_terms($post_id, $taxonomy_key)` returns assigned terms
- **Field config:** The taxonomy slug (e.g. `amenities`) is stored as a prop on the `Taxonomy_Field` object

Each term's properties (icon, label, slug, color, etc.) are resolved by `Term_Data_Group`.

**Evidence:**
- `themes/voxel/app/post-types/fields/taxonomy-field.php:239` — `get_value_from_post()` uses `get_the_terms()`
- `themes/voxel/app/post-types/fields/taxonomy-field/exports.php:14-24` — exports as `Object_List` of `Term` objects

---

## Two Bugs Fixed

### Bug 1 — Missing taxonomy field handler in `resolve_voxel_field()`

No code path existed to detect a Voxel `Taxonomy_Field` and delegate to `Term_Data_Group`.

**Fix:** Added `resolve_taxonomy_field()` method and wired it in before the `get_post_meta()` fallback:

```php
// In resolve_voxel_field():
if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
    $result = $this->resolve_taxonomy_field( $field_key, $sub_path );
    if ( $result !== null ) {
        return $result;
    }
}
```

### Bug 2 — `Term_Data_Group` has a protected constructor

When implementing the fix, calling `new Term_Data_Group(...)` threw:

```
Exception: Call to protected VoxelFSE\Dynamic_Data\Data_Groups\Term_Data_Group::__construct()
from scope VoxelFSE\Dynamic_Data\Data_Groups\Post_Data_Group
```

`Term_Data_Group` uses a **static factory method** pattern — the constructor is `protected` and must be called via `Term_Data_Group::get()`:

```php
// ❌ WRONG — constructor is protected
$term_group = new Term_Data_Group( $term_id, $taxonomy );

// ✅ CORRECT — use the static factory
$term_group = Term_Data_Group::get( $term_id, $taxonomy );
```

This pattern applies to all data groups that extend `Base_Data_Group`. Always check for a `::get()` factory before using `new`.

---

## The Fix

**File:** `app/public/wp-content/themes/voxel-fse/app/dynamic-data/data-groups/Post_Data_Group.php`

```php
/**
 * Resolve taxonomy field sub-properties via Voxel's field API.
 *
 * Handles paths like: @post(amenities.icon), @post(categories.label)
 * Taxonomy fields in Voxel store terms via WordPress taxonomy API (get_the_terms).
 * Each term has properties (icon, label, slug, color, etc.) exposed via Term_Data_Group.
 *
 * Returns the first term's sub-property value (matching Voxel's non-loop behavior).
 * In a loop context, the loop system iterates over all terms.
 */
protected function resolve_taxonomy_field( string $field_key, array $sub_path ): ?string {
    try {
        $post = \Voxel\Post::get( $this->post_id );
        if ( ! $post ) {
            return null;
        }

        $field = $post->get_field( $field_key );
        if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Taxonomy_Field ) ) {
            return null; // Let the caller fall through to other handlers
        }

        $taxonomy_key = $field->get_prop( 'taxonomy' );
        if ( empty( $taxonomy_key ) ) {
            return null;
        }

        $terms = get_the_terms( $this->post_id, $taxonomy_key );
        if ( empty( $terms ) || is_wp_error( $terms ) ) {
            return ''; // Post has no terms in this taxonomy
        }

        // Use first term's sub-property (non-loop context)
        $first_term = $terms[0];
        $term_group = Term_Data_Group::get( $first_term->term_id, $first_term->taxonomy );
        return $term_group->resolve_property( $sub_path );
    } catch ( \Throwable $e ) {
        return null;
    }
}
```

---

## Supported Expressions

After this fix, all taxonomy field sub-properties work in `@post()` tags:

| Expression | Returns |
|---|---|
| `@post(amenities.icon)` | `"svg:103"` — attachment ID of SVG icon |
| `@post(amenities.label)` | `"Bathtub"` — term name |
| `@post(amenities.slug)` | `"bathtub"` — term slug |
| `@post(categories.color)` | `"#ff6b6b"` — term color |
| `@post(features.icon)` | `"svg:45"` — attachment ID |

All of these delegate to `Term_Data_Group::resolve_property()` which already handled these properties correctly — the fix simply connects `Post_Data_Group` to it.

---

## Dynamic Icon Resolution (Two-Step)

For icon sub-properties specifically, the resolved value is in the format `"svg:{attachment_id}"`. The frontend/editor must perform a second step to get a usable URL:

```
@post(amenities.icon)
  ↓ REST API render
"svg:103"
  ↓ parse: attachment_id = 103
  ↓ GET /wp/v2/media/103
{ source_url: "https://.../bathtub.svg" }
  ↓ render inline SVG
<svg aria-hidden="true">...</svg>
```

**Editor:** `useResolvedDynamicIcon` hook in `app/blocks/shared/utils/useResolvedDynamicText.ts` handles this two-step resolution.

**Frontend SSR (render.php):** Resolves the expression → parses `svg:{id}` → calls `wp_get_attachment_url($id)` → reads local SVG file → inlines SVG content.

---

## Data Group Factory Pattern

`Base_Data_Group` subclasses use a **protected constructor + static factory** pattern:

| Class | Factory method |
|---|---|
| `Term_Data_Group` | `Term_Data_Group::get($term_id, $taxonomy)` |
| `User_Data_Group` | `User_Data_Group::get($user_id)` |
| `Post_Data_Group` | `new Post_Data_Group($post_id)` — public constructor |
| `Site_Data_Group` | `new Site_Data_Group()` — public constructor |

Always check if a class uses `::get()` before calling `new`. The protected constructor throws a fatal error when called from outside the class hierarchy.

---

## Applying This Pattern to Other Blocks

Any block that resolves `@post(taxonomy_field.sub_property)` in dynamic tags benefits from this fix automatically — it's in the shared `Post_Data_Group` resolver, not block-specific code.

If you encounter a similar gap for a **different data group** (e.g., resolving a sub-property on a `User` field that delegates to another group), apply the same three-step pattern:

1. Detect the field type via Voxel's field API (`$post->get_field($key) instanceof SomeFieldClass`)
2. Get the related group via its static factory (`RelatedGroup::get(...)`)
3. Delegate to `$related_group->resolve_property($sub_path)`
