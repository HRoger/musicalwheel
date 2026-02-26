# Dynamic Image Tag Resolution — Image / Gallery / Slider Blocks

**Date:** 2026-02-20
**Branch:** 14-fix-lint-errors
**Affects:** `app/blocks/src/image/`, `app/blocks/src/gallery/`, `app/blocks/src/slider/`

---

## Problem

When `imageDynamicTag` (e.g., `@tags()@term(image)@endtags()`) was set on an Image (VX) block, the **editor showed an empty placeholder** — no image appeared in the preview. The block also returned `null` from `save.tsx` when `image.url` was empty, meaning no markup was even output to the page.

Root cause: dynamic tags are **server-side resolved at frontend render time**. There was no mechanism to:
1. Preview the resolved image in the Gutenberg editor
2. Output a placeholder element in `save.tsx` that `render.php` could replace at runtime
3. Pass the correct post type to the REST API so sample post data was fetched from the right post type

---

## How Dynamic Tags Are Stored

VoxelScript expressions are stored **without the `@tags()...@endtags()` wrapper** in the block attribute — that wrapper is added automatically by the control (e.g., `GalleryUploadControl.wrapWithTags()`):

- **User enters:** `@post(gallery.ids)`
- **Stored in attribute:** `@tags()@post(gallery.ids)@endtags()`

This is important: never manually add or strip `@tags()...@endtags()` when configuring block attributes.

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

### 3. `useTemplateContext.ts` — Extract post type from template slug

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/shared/utils/useTemplateContext.ts`

Added a new `useTemplatePostType()` hook and shared `getTemplateSlug()` helper. This was required because the REST API needs to know the correct post type to fetch sample posts that actually have the relevant Voxel fields (e.g., `gallery`, `_thumbnail_id`).

```ts
/**
 * Internal helper: reads the current template slug from the editor store.
 * Works in both site editor (core/edit-site) and post editor (core/editor).
 */
function getTemplateSlug(select: any): string {
    const editSite = select('core/edit-site');
    if (editSite) {
        const editedPostId = editSite.getEditedPostId?.();
        if (typeof editedPostId === 'string') return editedPostId;
    }
    const editor = select('core/editor');
    if (editor) {
        const post = editor.getCurrentPost?.();
        if (post?.slug) return post.slug;
    }
    return '';
}

/**
 * Returns the Voxel post type key from the current template slug.
 * e.g. "voxel-place-single" → "place", "voxel-place-card" → "place"
 * Returns undefined when not on a post template (term_card/user_card are excluded).
 *
 * NOTE: Matches both -single and -card suffixes. Guards against term_card/user_card
 * slugs which contain the word "card" but are term/user context, not post.
 */
export function useTemplatePostType(): string | undefined {
    return useSelect((select: any) => {
        const slug = getTemplateSlug(select);
        const match = slug.match(/voxel-([a-z0-9_-]+)-(?:single|card)/);
        if (match && !match[1].includes('term_') && !match[1].includes('user_')) {
            return match[1];
        }
        return undefined;
    }, []) as string | undefined;
}
```

**Why the regex supports hyphens:** Voxel post type keys can contain hyphens (e.g., `real-estate`). The original pattern `/voxel-([a-z0-9_]+)-single/` would match `voxel-real` (stopping at the first hyphen) and return an incorrect post type.

**Card template fix (2026-02-25):** Voxel also generates card templates with the pattern `voxel-{post_type}-card` (e.g. `voxel-place-card`). These were not matched by `-single` and fell through to `post_type: undefined`, so PHP defaulted to fetching standard WordPress `post` type posts which have none of the Voxel custom fields.

**Current pattern:** `/voxel-([a-z0-9_-]+)-(?:single|card)/` — matches both `-single` and `-card` suffixes. A guard (`!match[1].includes('term_') && !match[1].includes('user_')`) prevents false matches on `term_card` and `user_card` slugs, which contain "card" but represent term/user context, not post context.

---

### 4. `edit.tsx` — Pass template context + post type to component

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/edit.tsx`

`useTemplateContext()` and `useTemplatePostType()` are React hooks (use `useSelect`) and **cannot be called conditionally or inside shared components that also render on the frontend**. They must be called at the top level of the editor-only `edit.tsx`.

```tsx
import { useTemplateContext, useTemplatePostType } from '@shared/utils/useTemplateContext';

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
    const templateContext = useTemplateContext();   // 'post' | 'term' | 'user'
    const templatePostType = useTemplatePostType(); // 'place' | 'real-estate' | undefined
    // ...
    <ImageComponent
        attributes={attributes}
        context="editor"
        templateContext={templateContext}
        templatePostType={templatePostType}
    />
}
```

The same pattern is used in `gallery/edit.tsx` and `slider/edit.tsx`.

---

### 5. `ImageComponent.tsx` — Editor preview via REST API with post type

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/shared/ImageComponent.tsx`

The shared component (used by both editor and frontend) resolves dynamic image tags in the **editor context only** via a 2-step REST API call. The critical fix here is passing `post_type` in `preview_context` so the REST endpoint fetches a sample post from the correct post type.

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
            // Pass post type so the API fetches sample posts from the right post type
            // (e.g., 'place' posts have a 'gallery' field, standard 'post' posts don't)
            if (templatePostType) {
                previewContext['post_type'] = templatePostType;
            }
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
}, [context, attributes.imageDynamicTag, hasDynamicImage, templateContext, templatePostType]);

// Static image takes priority; dynamic image is the fallback for editor preview
const effectiveImageUrl = attributes.image.url || dynamicImageUrl;
```

**TypeScript note:** `previewContext` is typed as `Record<string, string>`, which requires bracket notation for property access: `previewContext['post_type']` not `previewContext.post_type`. The TypeScript rule `noPropertyAccessFromIndexSignature` enforces this.

The `cancelled` flag prevents React state updates after the component unmounts (standard async cleanup pattern).

---

### 6. `rest-api.php` — `build_preview_context()` with post type support

**File:** `app/public/wp-content/themes/voxel-fse/app/dynamic-data/rest-api.php`

In the Gutenberg site editor, there is no "queried object" — WordPress's `get_queried_object()` returns null because we're editing a template, not viewing a real term/post page. `Block_Renderer::get_default_context()` only adds the `term` or `post` data groups when a real `WP_Term` or `WP_Post` is the queried object.

**Fix:** The `render_expression` endpoint accepts an optional `preview_context` parameter. When provided, `build_preview_context()` fetches a sample record from the database:

```php
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
        // Use provided post_type, default to 'post' only as a last resort
        $post_type = $preview_context['post_type'] ?? 'post';
        $posts = get_posts(['post_type' => $post_type, 'posts_per_page' => 1, 'post_status' => 'publish']);
        if ( !empty($posts) ) {
            $context['post'] = new \VoxelFSE\Dynamic_Data\Data_Groups\Post_Data_Group( $posts[0]->ID );
        }
    }

    return $context;
}
```

**Why `post_type` matters:** Without it, the API defaulted to `post_type: 'post'` (standard WordPress blog posts). These have no Voxel `gallery` or other custom fields. The expression `@post(gallery.ids)` would resolve to empty string because the sample post didn't have that field. With `post_type: 'place'`, the API fetches a Place post which does have the `gallery` field.

---

### 7. Image alignment fix — `style.css`

**File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/image/style.css`

**Problem:** In Elementor, image widgets fill the full column width because Elementor columns use `align-items: stretch` (CSS flexbox default). This allows `text-align: center` on the widget container to meaningfully position the `display: inline-block` image within the full-width container.

In Gutenberg, parent columns can use `align-items: flex-start`. Without `width: 100%` on the block, the block shrinks to the image's natural size (e.g., 150px), making `text-align` useless — the container is no wider than the image itself.

**Fix:** Added `width: 100%` to force the block to fill its parent column regardless of the parent's `align-items` setting:

```css
/* Base widget container - matches .elementor-widget-image */
/* width: 100% ensures the block fills its flex column parent (like Elementor widget stretching to
   full column width), so text-align can meaningfully position the inline-block img within the
   full-width container. */
.wp-block-voxel-fse-image {
    text-align: center;
    width: 100%;
}
```

**Verified:** Block width changed from 150px (image natural size) → 352px (full column width) after the fix.

---

## Data Flow Summary

### Post single template (e.g., `voxel-place-single`)

```
EDITOR (preview)
─────────────────────────────────────────────────────────
useTemplatePostType() reads slug "voxel-place-single"
  → extracts "place" via /voxel-([a-z0-9_-]+)-single/

ImageComponent.tsx
  ↓ POST /voxel-fse/v1/dynamic-data/render
  │   { expression: "@tags()@post(gallery.ids)@endtags()",
  │     preview_context: { type: "post", post_type: "place" } }
  ↓
REST_API::render_expression()
  ↓ build_preview_context() → get_posts(['post_type' => 'place'])
  ↓ Block_Renderer::render_expression("@tags()@post(gallery.ids)@endtags()", $context)
  ↓ returns "@tags()42,28,112,91,12@endtags()"
  ↓
GalleryComponent / ImageComponent strips wrapper → "42,28,112,91,12"
  ↓ GET /wp/v2/media/42 → { source_url: "https://.../photo1.jpg" }
  ↓ Shows real preview image in editor


FRONTEND (runtime)
─────────────────────────────────────────────────────────
save.tsx outputs:
  <img src="" alt="" loading="lazy" data-dynamic-image="@tags()@post(gallery.ids)@endtags()">

render.php intercepts:
  ↓ Block_Renderer::render_expression("@tags()@post(gallery.ids)@endtags()")
  │   (this time get_queried_object() IS a real WP_Post of type 'place')
  ↓ returns "@tags()96@endtags()"
  ↓ strip wrapper → 96
  ↓ wp_get_attachment_image_url(96, 'large')
  ↓ preg_replace() replaces <img src=""> with real image URL
```

### Term card template (e.g., `voxel-term_card-wzgbmdvy`)

```
EDITOR (preview)
─────────────────────────────────────────────────────────
useTemplateContext() reads slug → "voxel-term_card-wzgbmdvy" → type: "term"
useTemplatePostType() → no match (not a post single template) → undefined

ImageComponent.tsx
  ↓ POST /voxel-fse/v1/dynamic-data/render
  │   { expression: "@tags()@term(image)@endtags()",
  │     preview_context: { type: "term" } }
  ↓
REST_API → build_preview_context() → fallback: search all public taxonomies
  → finds first term with voxel_image meta set
  ↓ Block_Renderer::render_expression() → "@tags()96@endtags()"
  ↓ strip wrapper → 96 → GET /wp/v2/media/96 → shows preview image
```

---

## The `@tags()...@endtags()` Wrapper

This is a Voxel internals detail. The `Block_Renderer` wraps all resolved output in `@tags()...@endtags()` tokens. When a single tag is resolved:

- Input: `@tags()@term(image)@endtags()`
- Output: `@tags()96@endtags()`

The inner value `96` is the attachment ID, but the wrapper must be stripped before using it. Both component files and `render.php` use the same strip pattern:

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

## Universality — Works for Any VoxelScript Expression

The fix is not specific to `@post(gallery.ids)` or `@term(image)`. It works for **any VoxelScript expression** on any post-type single template:

- `@post(product.product_type.variable-product.variation_images)` — variation images on a product type
- `@post(_thumbnail_id.id)` — featured image attachment ID
- `@post(gallery.ids)` — gallery field attachment IDs
- Comma-separated expressions (e.g., `@post(a), @post(b)`) — resolved as a combined string

The mechanism:
1. Extracts post type from template slug via `useTemplatePostType()`
2. Passes it to the REST API via `preview_context.post_type`
3. API fetches a sample post of that type, which has the correct Voxel fields
4. `Block_Renderer` resolves the expression against that sample post

---

## Term Card — Known Limitation (Deferred)

**Current behavior:** When editing a term card template (e.g., `voxel-term_card-wzgbmdvy`), the editor uses a fallback: searches all public taxonomies for a term with `voxel_image` meta. This works but finds a random term, not necessarily from the correct taxonomy.

**Root cause:** Voxel's term card `unique_key` (e.g., `wzgbmdvy`) is a random 8-character string with no relation to the taxonomy name. There is no config file or database table that maps `unique_key` → `taxonomy`. The connection exists only at the widget level — users select both the taxonomy AND the card template in the Term Feed widget settings.

**Precise fix:** When working on the Term Feed block, the taxonomy can be passed explicitly:
```ts
preview_context: { type: "term", taxonomy: "place_category" }
```
This requires knowing the taxonomy at edit time (e.g., from block attributes configured in the Term Feed parent block).

**Status:** Deferred. Current fallback is functional for most cases.

---

## Applying This Pattern to Other Blocks

Any block that needs to display a dynamic image tag (not just text) requires the same 3-layer approach:

| Layer | What to do |
|---|---|
| `save.tsx` | Output `data-dynamic-{field}="..."` placeholder instead of returning null |
| `render.php` | Use `Block_Renderer::render_expression()` + strip wrapper + resolve to URL/value + preg_replace |
| `edit.tsx` | Call `useTemplateContext()` + `useTemplatePostType()` at top level, pass to component |
| Component | Use `apiFetch` to call `/voxel-fse/v1/dynamic-data/render` with `preview_context` including `post_type` |

For **text** dynamic tags (not images), the frontend can usually render from the saved HTML directly via the `Block_Renderer` in `render.php` — no two-step attachment ID lookup needed.

---

## Files Changed

| File | Change |
|---|---|
| `app/blocks/src/image/save.tsx` | Output `data-dynamic-image` placeholder when `imageDynamicTag` is set |
| `app/blocks/src/image/render.php` | Server-side: resolve tag → attachment ID → image URL → replace placeholder |
| `app/blocks/src/image/shared/ImageComponent.tsx` | Editor-side: 2-step REST API resolution with `post_type` in `preview_context`; bracket notation for TS `noPropertyAccessFromIndexSignature` |
| `app/blocks/src/image/edit.tsx` | Pass `templateContext` + `templatePostType` to `ImageComponent` |
| `app/blocks/src/image/style.css` | Added `width: 100%` to fix alignment in Gutenberg flex columns |
| `app/blocks/src/gallery/edit.tsx` | Same `useTemplatePostType()` pattern as image |
| `app/blocks/src/gallery/shared/GalleryComponent.tsx` | Pass `post_type` in `preview_context` to REST API |
| `app/blocks/src/slider/edit.tsx` | Same `useTemplatePostType()` pattern as image |
| `app/blocks/src/slider/shared/SliderComponent.tsx` | Pass `post_type` in `preview_context` to REST API |
| `app/blocks/shared/utils/useTemplateContext.ts` | Added `useTemplatePostType()` hook; extracted shared `getTemplateSlug()` helper; updated regex to support hyphens in post type names |
| `app/dynamic-data/rest-api.php` | `build_preview_context()` now uses `post_type` param from `preview_context` instead of defaulting to `'post'` |
