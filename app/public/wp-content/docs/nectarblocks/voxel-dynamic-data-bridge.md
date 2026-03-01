# Voxel Dynamic Data Bridge for NectarBlocks

**Created:** 2026-02-24
**Branch:** `16-continuing-nb-eTags`
**Controller:** `themes/voxel-fse/app/controllers/fse-nb-voxel-source-controller.php`
**Tests:** `themes/voxel-fse/tests/Unit/Controllers/FSENBVoxelSourceControllerTest.php`

---

## What This Is

`FSE_NB_Voxel_Source_Controller` registers Voxel post type fields as a native data source inside NectarBlocks' Dynamic Data system. When a user clicks the **database icon** in any NB block (Text, Image, Button, etc.), they now see a **"Voxel: {Post Type}"** group alongside the built-in Post, Author, and ACF groups.

This is a **simple fallback** for quick field-to-block binding. For advanced use cases that need modifiers, conditional rendering, or the full 31+ tag system, use `@tags()` instead (see `fse-nb-dynamic-tags-controller.php`).

---

## Why Two Systems Coexist

| System | How It's Triggered | Use Case |
|--------|-------------------|----------|
| **Voxel Bridge** (this) | NB "database icon" → Field dropdown | Simple binding — show a field value |
| **@tags() Dynamic Tags** | `voxelDynamicTags` block attribute | Advanced — modifiers, conditions, fallbacks |

They operate at completely different layers and do not conflict. Both can be used on the same page.

---

## Architecture

NectarBlocks' Dynamic Data has **two separate systems** that required two separate integration points:

### 1. REST API Interceptor (Editor Dropdown)

NB's editor JS fetches `/nectar/v1/post-data/dynamic-fields?postId={id}` to populate the Field dropdown. This endpoint has no filter hook, so we use `rest_post_dispatch` to intercept the response and append our Voxel groups.

```
Editor JS → GET /nectar/v1/post-data/dynamic-fields
         ← [...existing groups, { label: "Voxel: Stays", options: [...] }]
```

**Key detail:** In template context (`postId=0` or `wp_template` post type), we show fields for **all** Voxel post types since we can't know which type the template will be used with. For a concrete post ID, we show only that post's type.

### 2. PHP Filters (Frontend Rendering)

Two filter pairs handle the actual value rendering on the frontend:

```
nectar_blocks_dynamic_data/currentPost/fields  (priority 3)
nectar_blocks_dynamic_data/otherPosts/fields   (priority 3)
→ Populates field registry with Voxel fields in the format Frontend_Render.php expects.

nectar_blocks_dynamic_data/currentPost/content (priority 21)
nectar_blocks_dynamic_data/otherPosts/content  (priority 21)
→ Renders the actual field value when NB processes its {{!!nb_dynamic!!}} markers.
```

Priorities are set just after ACF (which uses 2 and 20).

---

## Supported Field Types

| Voxel Field Type | Render Output | Notes |
|-----------------|---------------|-------|
| `text`, `textarea`, `email`, `phone`, `url`, `number`, `date`, `time`, `color`, `select` | Plain string | Via `get_post_meta()` |
| `texteditor` | HTML (frontend) / placeholder text (editor) | |
| `switcher` | Configurable true/false text | Reads `isTrueText`/`isFalseText` attributes |
| `image` | URL (attribute context) or `<img>` tag (content context) | Voxel stores as comma-separated attachment IDs |
| `file` | File URL | First attachment ID only |
| `taxonomy` | Comma-separated term names | Uses `get_the_terms()` |
| `location` | Address string | Parses JSON or array meta value |

### Skipped Types (Too Complex for Simple Bridge)

`repeater`, `work-hours`, `recurring-date`, `post-relation`, `product`, `title`, `ui-step`, `ui-heading`, `ui-html`, `ui-image`

---

## Response Format

The REST response appends groups matching NB's existing format:

```json
[
  { "label": "Custom Fields", "options": [...] },
  { "label": "Advanced Custom Fields", "options": [...] },
  { "label": "Voxel: Stays", "options": [
    { "value": "gallery", "label": "Gallery", "type": "image", "group": "voxel" },
    { "value": "area", "label": "Area (m²)", "type": "number", "group": "voxel" },
    { "value": "location", "label": "Location", "type": "location", "group": "voxel" }
  ]},
  { "label": "Voxel: Profiles", "options": [...] }
]
```

The frontend fields filter populates the registry in the format `Frontend_Render.php` expects:

```php
$fields['gallery'] = [
    'title'      => 'Gallery',
    'group'      => 'Voxel: Stays',
    'field_data' => [
        'type'       => 'image',
        'field_name' => 'gallery',
        'field_type' => 'voxel',    // gates the content filter
        'taxonomy'   => '',          // only populated for taxonomy fields
    ],
];
```

---

## Key Design Decisions

**1. `get_post_meta()` directly — not Voxel's field object API**
Simpler, avoids heavy Voxel object instantiation, matches the existing FSE dynamic-data pattern. Voxel's `get_value()` returns complex typed objects (arrays, `\Voxel\Term` objects) which would need further unwrapping.

**2. `field_type => 'voxel'` gate**
The content filter only acts when `$args['field_data']['field_type'] === 'voxel'`. This cleanly separates our fields from ACF, Post, and other sources — no risk of double-processing.

**3. Taxonomy slug in `field_data`**
The fields filter stores the taxonomy slug in `field_data['taxonomy']` so the content filter can call `get_the_terms()` with the correct taxonomy. Same pattern ACF uses for its type metadata.

**4. `title` field excluded**
NB already provides `post_title` natively. Adding it would create a confusing duplicate entry.

---

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `app/controllers/fse-nb-voxel-source-controller.php` | **Created** | Main controller (426 lines) |
| `functions.php` | **Edited** | Added `require_once` + `new` instantiation after existing NB controller |
| `tests/Unit/Controllers/FSENBVoxelSourceControllerTest.php` | **Created** | 19 tests, 42 assertions |
| `tests/helpers/wordpress-stubs.php` | **Edited** | Added `WP_REST_Response::set_data()`, `WP_REST_Request::get_route()`, `set_route()` |

---

## Unit Tests

Run with:
```bash
./vendor/bin/phpunit --filter=FSENBVoxelSourceControllerTest
```

**Coverage (19 tests, 42 assertions):**

- REST interceptor ignores unrelated routes
- REST interceptor skips error responses (401/404)
- REST interceptor appends Voxel groups, filters skipped types
- REST interceptor returns single post type for concrete post ID
- Frontend fields filter populates output with correct structure
- Frontend fields filter returns unmodified output for non-Voxel types
- Content filter skips non-Voxel fields (ACF, etc.)
- Content renders: text, switcher (true/false), image URL, image `<img>` tag, taxonomy, location (JSON + array), texteditor placeholder, file URL, empty for unknown type

---

## Discovery Notes

The most non-obvious discovery during implementation: NectarBlocks has **two separate systems** for dynamic data that appear to be one from the outside:

1. **Editor dropdown** — populated via REST API call (JavaScript-side). The PHP `fields` filter does NOT affect this.
2. **Frontend rendering** — handled entirely by PHP filters. The REST endpoint is never called on the frontend.

This means a naive implementation that only hooks the PHP filters would show no fields in the editor dropdown. The `rest_post_dispatch` interceptor is essential for the editor experience.

The REST namespace is `nectar/v1` (NOT `nectar-blocks/v1`) — confirmed in `nectar-blocks/includes/API/Router.php:77`.
