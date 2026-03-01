# Dynamic Data — Field Sub-Property Resolution & Template Context

**Date:** 2026-02-26 (initial), 2026-02-27 (all handlers + context fix)
**Branch:** 19-template-sync
**Affects:**
- `app/dynamic-data/data-groups/Post_Data_Group.php`
- `app/blocks/shared/utils/useTemplateContext.ts`

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

---

## Broader Audit: Other Missing Sub-Property Handlers (2026-02-27)

The taxonomy field fix exposed a **systemic gap** in `resolve_voxel_field()`. Multiple Voxel field types export sub-properties via `dynamic_data()` that our resolver doesn't handle. When a `@post(field.sub_property)` expression hits one of these, it falls through to `get_post_meta()` which either returns raw JSON or empty — silently failing.

### Handler Coverage (All Complete — 2026-02-27)

| Field Type | Voxel Class | Sub-Properties | FSE Handler | Status |
|---|---|---|---|---|
| File/Image | `File_Field` | `ids`, `id`, `url`, `name` | switch/case in `resolve_voxel_field()` | ✅ Handled |
| Product addons | `Product_Field` | `addon.price`, `addon.label`, etc. | `resolve_product_field_addon()` | ✅ Handled |
| Taxonomy | `Taxonomy_Field` | `icon`, `label`, `slug`, `color`, etc. | `resolve_taxonomy_field()` | ✅ Fixed 2026-02-26 |
| Location | `Location_Field` | `address`, `lat`, `lng`, `short_address`, `medium_address`, `long_address` | `resolve_location_field()` | ✅ Implemented 2026-02-27 |
| Post Relation | `Post_Relation_Field` | All post properties via related post | `resolve_post_relation_field()` | ✅ Implemented 2026-02-27 |
| Work Hours | `Work_Hours_Field` | `status`, `status_label`, `{weekday}.*` | `resolve_work_hours_field()` | ✅ Implemented 2026-02-27 |
| Date | `Date_Field` | `date`, `is_finished` | `resolve_date_field()` | ✅ Implemented 2026-02-27 |
| Recurring Date | `Recurring_Date_Field` | `upcoming.start`, `upcoming.end`, `previous.*`, `all.*` | `resolve_recurring_date_field()` | ✅ Implemented 2026-02-27 |

### Remaining Gap

| Field Type | Voxel Class | Status | Notes |
|---|---|---|---|
| **Repeater** | `Repeater_Field` | ⚠️ Not implemented | Works in loop context; sub-property access is complex (nested fields). Low priority — no `@post()` dynamic tag usage found. |

### New Handler Details (2026-02-27)

#### `resolve_location_field()`
- Parses JSON from post meta key matching the field key
- Supports: `address`, `lat`/`latitude`, `lng`/`longitude`, `short_address`, `medium_address`, `long_address`
- Storage: JSON object `{ "address": "...", "lat": 52.37, "lng": 4.89 }` in post meta

#### `resolve_post_relation_field()`
- Gets related post IDs via `$field->get_value()` (returns array of post IDs)
- Uses first related post (non-loop context), creates `new Post_Data_Group($related_id)`
- Delegates sub-property resolution to the related post's data group

#### `resolve_work_hours_field()`
- Parses JSON schedule groups from post meta
- Calculates `status` ("open"/"closed") and `status_label` ("Open now"/"Closed") based on current day/time
- Supports per-weekday access: `@post(work_hours.monday)`, `@post(work_hours.tuesday)`, etc.

#### `resolve_date_field()`
- Handles `date` (raw date string from meta) and `is_finished` (compares with current time)
- Storage: Date string in post meta

#### `resolve_recurring_date_field()`
- Parses JSON array of date entries from post meta
- Filters by temporal category: `upcoming` (future dates), `previous` (past dates), `all`
- Each entry supports: `start`, `end`, `is_multiday`, `is_happening_now`, `is_allday`

### Handler Dispatch Order in `resolve_voxel_field()`

All handlers are checked **before** the `get_post_meta()` fallback, in this order:

1. File/image sub-properties (switch/case)
2. Product field addons (`resolve_product_field_addon()`)
3. Taxonomy fields (`resolve_taxonomy_field()`)
4. Location fields (`resolve_location_field()`)
5. Post relation fields (`resolve_post_relation_field()`)
6. Work hours fields (`resolve_work_hours_field()`)
7. Date fields (`resolve_date_field()`)
8. Recurring date fields (`resolve_recurring_date_field()`)
9. **Fallback:** `get_post_meta()` + sub-property extraction

Each handler returns `null` if the field is not its type, allowing the next handler to try. This ensures no false matches.

**Evidence files for each field type's export behavior:**
- Location: `themes/voxel/app/post-types/fields/location-field.php:169-233`
- Work Hours: `themes/voxel/app/post-types/fields/work-hours-field.php:262-350`
- Recurring Date: `themes/voxel/app/post-types/fields/recurring-date-field.php:344-427`
- Post Relation: `themes/voxel/app/post-types/fields/post-relation-field/exports.php:15-90`
- Date: `themes/voxel/app/post-types/fields/date-field.php:108-131`

---

## Template Context Detection Fix (2026-02-27)

### Problem

`@term(:label)` and other `@term()` dynamic tags returned raw VoxelScript text in the editor canvas when editing `term_single` templates (e.g., "Recent stays in @term(:label)" instead of "Recent stays in Amsterdam").

This affected all blocks using EnableTag on term_single and user_single templates.

### Root Cause

**File:** `app/blocks/shared/utils/useTemplateContext.ts`

`useTemplateContext()` determines whether the editor is in a `post`, `term`, or `user` context by reading the template slug. It only checked for `term_card`:

```typescript
// BEFORE (buggy)
if (slug.includes('term_card')) return 'term';
if (slug.includes('user_card')) return 'user';
return 'post';
```

Template slug for a term_single template is `voxel-fse//voxel-term_single-pouit0fb`. Since `term_card` was not in this string, it fell through to `'post'` context. The REST API then tried to resolve `@term(:label)` against a post — which returned empty.

### Fix (v1 — 2026-02-27)

Updated to detect both `_card` and `_single` variants:

```typescript
if (slug.includes('term_card') || slug.includes('term_single')) return 'term';
if (slug.includes('user_card') || slug.includes('user_single')) return 'user';
return 'post';
```

### Fix (v2 — 2026-02-27) — Complete Template Slug Registry

After auditing all 17 template slugs from the database and the Voxel source code, rewrote `useTemplateContext.ts` with:
1. **Comprehensive JSDoc** documenting every slug pattern
2. **`NON_POST_TYPE_PREFIXES`** constant to exclude `header`, `footer`, `kit` from post type extraction
3. **`archive` support** in `useTemplatePostType()` — previously only matched `single|card`, now also matches `archive`
4. **29 test cases** verified against all real and hypothetical slugs

### Complete Template Slug Registry

Verified against the actual database (`wp/v2/templates` REST endpoint) and Voxel source code:

**Post type templates** — generated via `template-manager.php:163`: `sprintf('voxel-%s-%s', $post_type_key, $template_type)`

| Slug Pattern | Context | PostType | Example |
|---|---|---|---|
| `voxel-{type}-single` | `post` | `{type}` | `voxel-place-single` |
| `voxel-{type}-single-{hash}` | `post` | `{type}` | `voxel-place-single-pnzxppea` |
| `voxel-{type}-card` | `post` | `{type}` | `voxel-place-card` |
| `voxel-{type}-card-{hash}` | `post` | `{type}` | `voxel-place-card-dd0ri9mc` |
| `voxel-{type}-archive` | `post` | `{type}` | `voxel-place-archive` |

**Term templates** — generated via `template-utils.php:440-446`: custom_templates groups with 8-char random keys

| Slug Pattern | Context | PostType | Example |
|---|---|---|---|
| `voxel-term_single-{hash}` | `term` | — | `voxel-term_single-pouit0fb` |
| `voxel-term_card-{hash}` | `term` | — | `voxel-term_card-wzgbmdvy` |

**User templates** — same pattern as terms, reserved for future use

| Slug Pattern | Context | PostType | Example |
|---|---|---|---|
| `voxel-user_single-{hash}` | `user` | — | `voxel-user_single-abc12345` |
| `voxel-user_card-{hash}` | `user` | — | `voxel-user_card-xyz98765` |

**Layout templates** — no dynamic data context (default to `post`, postType = undefined)

| Slug Pattern | Context | PostType | Example |
|---|---|---|---|
| `voxel-header-default` | `post` | — | Header base template |
| `voxel-header-{hash}` | `post` | — | `voxel-header-5il3l5ds` |
| `voxel-footer-default` | `post` | — | Footer base template |
| `voxel-footer-{hash}` | `post` | — | `voxel-footer-odtnn1j5` |
| `voxel-kit_popups` | `post` | — | System template |
| `voxel-kit_timeline` | `post` | — | System template |

**WordPress defaults** — standard WP templates, no Voxel context

| Slug | Context | PostType |
|---|---|---|
| `page` | `post` | — |
| `archive` | `post` | — |
| `index` | `post` | — |
| `single` | `post` | — |

### Impact

This fix affects **all EnableTag-powered blocks** (NectarBlocks Text, Advanced List, etc.) when used inside term_single or user_single templates. The `preview_context` parameter sent to the dynamic-data REST API now correctly identifies the context, so `@term()` and `@user()` expressions resolve properly.

Additionally, `useTemplatePostType()` now correctly extracts the post type from `archive` templates (e.g., `voxel-place-archive` → `"place"`) and excludes layout templates (`header`, `footer`) from returning false post types.
