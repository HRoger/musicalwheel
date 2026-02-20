# Dynamic Image Tag Resolution — Image (VX) Block

**Date:** 2026-02-19
**Branch:** 13-fix-header-tpl
**Affects:** `app/blocks/src/image/`

---

## Problem

When `imageDynamicTag` (e.g., `@tags()@term(image)@endtags()`) was set on an Image (VX) block, the **editor showed an empty placeholder** — no image appeared in the preview. The block also returned `null` from `save.tsx` when `image.url` was empty, meaning no markup was even output to the page.

Root cause: dynamic tags are **server-side resolved at frontend render time**. There was no mechanism to:
1. Preview the resolved image in the Gutenberg editor
2. Output a placeholder element in `save.tsx` that `render.php` could replace at runtime

---

## What `@term(image)` Returns

Understanding the data type is critical. `@term(image)` resolves to an **attachment ID (integer)**, not a URL.

```
@tags()@term(image)@endtags()
    ↓ Block_Renderer::render_expression()
@tags()96@endtags()
    ↓ strip wrapper
96
    ↓ wp_get_attachment_image_url(96, 'large')
https://musicalwheel.local/stays/wp-content/uploads/.../image.jpg
```

The `@tags()...@endtags()` wrapper tokens are preserved around the resolved inner value and **must be stripped** before parsing the result as an integer.

---

## Changes Made

### 1. `save.tsx` — Output placeholder for server-side resolution

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/save.tsx`

Previously, `save()` returned `null` when `attributes.image.url` was empty, even if a dynamic tag was configured. This meant `render.php` received empty content with nothing to replace.

**Fix:** When `imageDynamicTag` is set, output a placeholder `<img data-dynamic-image="...">` element that `render.php` can locate and replace:

```tsx
const hasDynamicImage = attributes.imageDynamicTag && attributes.imageDynamicTag.includes('@');

// Return null only if both static URL AND dynamic tag are absent
if (!attributes.image.url && !hasDynamicImage) {
    return null;
}

// When dynamic tag set but no static image: render placeholder for render.php
const imageElement = hasDynamicImage && !attributes.image.url ? (
    <img
        src=""
        alt=""
        loading="lazy"
        data-dynamic-image={attributes.imageDynamicTag}
        className={...}
        style={...}
    />
) : (
    <img src={attributes.image.url} alt={...} ... />
);
```

The `data-dynamic-image` attribute carries the raw expression so `render.php` knows what to resolve.

---

### 2. `render.php` — Server-side resolution

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/render.php`

Added a resolution pass **before** the existing attachment caption logic:

```php
if ( ! empty( $attributes['imageDynamicTag'] ) && strpos( $content, 'data-dynamic-image=' ) !== false ) {
    $dynamic_tag = $attributes['imageDynamicTag'];

    // Step 1: Resolve expression to get attachment ID
    $resolved = '';
    if ( class_exists( '\VoxelFSE\Dynamic_Data\Block_Renderer' ) ) {
        $resolved = \VoxelFSE\Dynamic_Data\Block_Renderer::render_expression( $dynamic_tag );
    }

    // Step 2: Strip @tags()...@endtags() wrapper (always present around resolved inner value)
    if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $resolved, $tag_match ) ) {
        $resolved = $tag_match[1];
    }

    // Step 3: Convert attachment ID → image URL
    if ( ! empty( $resolved ) && is_numeric( $resolved ) ) {
        $image_id   = (int) $resolved;
        $image_size = ! empty( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
        $image_url  = wp_get_attachment_image_url( $image_id, $image_size );
        $image_alt  = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

        if ( $image_url ) {
            // Replace placeholder <img> with fully resolved image
            $content = preg_replace(
                '#<img\s+src=""\s+alt=""\s+loading="lazy"\s+data-dynamic-image="[^"]*"([^>]*)/?>#',
                '<img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( $image_alt ?: '' ) . '" loading="lazy"$1/>',
                $content,
                1
            );
        } else {
            return ''; // Invalid attachment — hide block
        }
    } elseif ( empty( $resolved ) || '0' === $resolved ) {
        return ''; // No image set on this term — hide block
    }
}
```

**Key detail:** The regex `'#<img\s+src=""\s+alt=""\s+loading="lazy"\s+data-dynamic-image="[^"]*"([^>]*)/?>#'` matches the specific placeholder shape from `save.tsx` and preserves any extra attributes (CSS classes, inline styles) via the `$1` capture group.

---

### 3. `edit.tsx` — Pass template context to ImageComponent

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/edit.tsx`

`useTemplateContext()` is a React hook (uses `useSelect`) and **cannot be called conditionally or inside shared components that also render on the frontend**. It must be called at the top level of an editor-only component.

```tsx
import { useTemplateContext } from '@shared/utils/useTemplateContext';

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
    const templateContext = useTemplateContext(); // 'post' | 'term' | 'user'
    // ...
    <ImageComponent
        attributes={attributes}
        context="editor"
        templateContext={templateContext}
    />
}
```

`useTemplateContext()` reads the current template slug from the `core/edit-site` store to determine the context:
- `voxel-term_card-*` → `'term'`
- `voxel-user_card-*` → `'user'`
- Everything else → `'post'`

See: `app/blocks/shared/utils/useTemplateContext.ts`

---

### 4. `ImageComponent.tsx` — Editor preview via REST API

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/shared/ImageComponent.tsx`

The shared component (used by both editor and frontend) resolves dynamic image tags in the **editor context only** via a 2-step REST API call:

```tsx
const hasDynamicImage = attributes.imageDynamicTag && attributes.imageDynamicTag.includes('@');
const [dynamicImageUrl, setDynamicImageUrl] = useState<string | null>(null);

useEffect(() => {
    if (context !== 'editor' || !hasDynamicImage) {
        setDynamicImageUrl(null);
        return;
    }

    let cancelled = false;

    (async () => {
        try {
            // Step 1: Resolve dynamic tag → attachment ID
            const previewContext: Record<string, string> = { type: templateContext };
            const renderResult = await apiFetch<{ rendered: string }>({
                path: '/voxel-fse/v1/dynamic-data/render',
                method: 'POST',
                data: {
                    expression: attributes.imageDynamicTag,
                    preview_context: previewContext,
                },
            });

            if (cancelled) return;

            // Strip @tags()...@endtags() wrapper
            let rendered = renderResult.rendered;
            const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
            if (wrapperMatch) rendered = wrapperMatch[1];

            const attachmentId = parseInt(rendered, 10);
            if (!attachmentId || isNaN(attachmentId)) {
                setDynamicImageUrl(null);
                return;
            }

            // Step 2: Get image URL from WP REST media API
            const media = await apiFetch<{ source_url: string }>({
                path: `/wp/v2/media/${attachmentId}`,
            });

            if (cancelled) return;
            if (media?.source_url) setDynamicImageUrl(media.source_url);
        } catch (err) {
            if (!cancelled) console.error('Failed to resolve dynamic image tag:', err);
        }
    })();

    return () => { cancelled = true; };
}, [context, attributes.imageDynamicTag, hasDynamicImage, templateContext]);

// Static image takes priority; dynamic image is the fallback for editor preview
const effectiveImageUrl = attributes.image.url || dynamicImageUrl;
```

The `cancelled` flag prevents React state updates after the component unmounts (standard async cleanup pattern).

---

### 5. `rest-api.php` — `build_preview_context()` for editor preview

**File:** `app/public/wp-content/themes/voxel-fse/app/dynamic-data/rest-api.php`

In the Gutenberg site editor, there is no "queried object" — WordPress's `get_queried_object()` returns null because we're editing a template, not viewing a real term page. `Block_Renderer::get_default_context()` only adds the `term` data group when a `WP_Term` is the queried object.

**Fix:** The `render_expression` endpoint accepts an optional `preview_context` parameter. When provided, `build_preview_context()` finds a sample term from the database:

```php
public static function render_expression( $request ) {
    $expression      = $request->get_param( 'expression' );
    $context         = $request->get_param( 'context' );
    $preview_context = $request->get_param( 'preview_context' );

    // Build preview context for editor (overrides default context)
    if ( ! empty( $preview_context ) && is_array( $preview_context ) ) {
        $context = self::build_preview_context( $preview_context );
    }

    $rendered = \VoxelFSE\Dynamic_Data\Block_Renderer::render_expression( $expression, $context );
    return new \WP_REST_Response(['expression' => $expression, 'rendered' => $rendered], 200);
}

private static function build_preview_context( array $preview_context ): array {
    $context = [
        'site' => new \VoxelFSE\Dynamic_Data\Data_Groups\Site_Data_Group(),
        'user' => \VoxelFSE\Dynamic_Data\Data_Groups\User_Data_Group::get( get_current_user_id() ),
    ];

    $type = $preview_context['type'] ?? '';

    if ( 'term' === $type ) {
        $taxonomy = $preview_context['taxonomy'] ?? '';

        if ( ! empty( $taxonomy ) ) {
            // Get first term from specified taxonomy
            $terms = get_terms(['taxonomy' => $taxonomy, 'number' => 1, 'hide_empty' => false]);
        } else {
            // No taxonomy — search all public taxonomies for a term with voxel_image meta
            foreach ( get_taxonomies(['public' => true], 'names') as $tax ) {
                $terms = get_terms([
                    'taxonomy' => $tax, 'number' => 1, 'hide_empty' => false,
                    'meta_query' => [['key' => 'voxel_image', 'compare' => 'EXISTS']],
                ]);
                if ( !empty($terms) && !is_wp_error($terms) ) break;
            }
        }

        if ( !empty($terms) && !is_wp_error($terms) ) {
            $context['term'] = \VoxelFSE\Dynamic_Data\Data_Groups\Term_Data_Group::get(
                $terms[0]->term_id,
                $terms[0]->taxonomy
            );
        }
    } elseif ( 'post' === $type ) {
        $post_type = $preview_context['post_type'] ?? 'post';
        $posts = get_posts(['post_type' => $post_type, 'posts_per_page' => 1, 'post_status' => 'publish']);
        if ( !empty($posts) ) {
            $context['post'] = new \VoxelFSE\Dynamic_Data\Data_Groups\Post_Data_Group( $posts[0]->ID );
        }
    }

    return $context;
}
```

**How the sample term is selected (no taxonomy specified):**
1. Iterates all public taxonomies
2. Looks for the first term that has a `voxel_image` meta key set
3. Uses that term as the preview context

This ensures the editor preview shows a real image rather than an empty placeholder.

---

## Data Flow Summary

```
EDITOR (preview)
─────────────────────────────────────────────────────────
ImageComponent.tsx
  ↓ POST /voxel-fse/v1/dynamic-data/render
  │   { expression: "@tags()@term(image)@endtags()",
  │     preview_context: { type: "term" } }
  ↓
REST_API::render_expression()
  ↓ build_preview_context() → finds sample term with voxel_image
  ↓ Block_Renderer::render_expression("@tags()@term(image)@endtags()", $context)
  ↓ returns "@tags()96@endtags()"
  ↓
ImageComponent.tsx strips wrapper → parseInt("96") = 96
  ↓ GET /wp/v2/media/96
  ↓ returns { source_url: "https://.../.../amsterdam.jpg" }
  ↓ setDynamicImageUrl("https://.../.../amsterdam.jpg")
  ↓ <img src="https://.../.../amsterdam.jpg"> shown in editor


FRONTEND (runtime)
─────────────────────────────────────────────────────────
save.tsx outputs:
  <img src="" alt="" loading="lazy" data-dynamic-image="@tags()@term(image)@endtags()">

render.php intercepts:
  ↓ Block_Renderer::render_expression("@tags()@term(image)@endtags()")
  │   (this time get_queried_object() IS a real WP_Term)
  ↓ returns "@tags()96@endtags()"
  ↓ strip wrapper → 96
  ↓ wp_get_attachment_image_url(96, 'large')
  ↓ preg_replace() replaces <img src=""> with <img src="https://.../amsterdam.jpg">
```

---

## The `@tags()...@endtags()` Wrapper

This is a Voxel internals detail. The `Block_Renderer` wraps all resolved output in `@tags()...@endtags()` tokens. When a single tag is resolved:

- Input: `@tags()@term(image)@endtags()`
- Output: `@tags()96@endtags()`

The inner value `96` is the attachment ID, but the wrapper must be stripped before using it. Both `ImageComponent.tsx` and `render.php` use the same strip pattern:

**PHP:**
```php
if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $resolved, $tag_match ) ) {
    $resolved = $tag_match[1];
}
```

**TypeScript:**
```ts
const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
if (wrapperMatch) rendered = wrapperMatch[1];
```

---

## Applying This Pattern to Other Blocks

Any block that needs to display a dynamic image tag (not just text) requires the same 3-layer approach:

| Layer | What to do |
|---|---|
| `save.tsx` | Output `data-dynamic-{field}="..."` placeholder instead of returning null |
| `render.php` | Use `Block_Renderer::render_expression()` + strip wrapper + resolve to URL/value + preg_replace |
| `edit.tsx` / component | Use `apiFetch` to call `/voxel-fse/v1/dynamic-data/render` with `preview_context` for editor preview |

For **text** dynamic tags (not images), the frontend can usually render from the saved HTML directly via the `Block_Renderer` in `render.php` — no two-step attachment ID lookup needed.

---

## Files Changed

| File | Change |
|---|---|
| `app/blocks/src/image/save.tsx` | Output `data-dynamic-image` placeholder when `imageDynamicTag` is set |
| `app/blocks/src/image/render.php` | Server-side: resolve tag → attachment ID → image URL → replace placeholder |
| `app/blocks/src/image/shared/ImageComponent.tsx` | Editor-side: 2-step REST API resolution for preview |
| `app/blocks/src/image/edit.tsx` | Pass `templateContext` from `useTemplateContext()` to `ImageComponent` |
| `app/dynamic-data/rest-api.php` | Add `preview_context` param + `build_preview_context()` for editor sample data |
