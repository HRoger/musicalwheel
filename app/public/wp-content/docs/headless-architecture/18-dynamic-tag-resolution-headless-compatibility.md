# Dynamic Tag Resolution — Headless Compatibility

**Date:** February 2026
**Status:** Partially implemented (WordPress-only); headless path defined
**Affects:** image, gallery, slider blocks
**Related:** [01-accelerated-option-c-plus-strategy.md](01-accelerated-option-c-plus-strategy.md), [17-server-side-config-injection.md](17-server-side-config-injection.md)

---

## Overview

Dynamic tags (e.g. `@tags()@term(image)@endtags()`) allow block attributes to be resolved at **runtime** from contextual data (the current term, post, or user) rather than being hardcoded at editor time.

Three blocks support dynamic image tags:

| Block | Attribute | Architecture | Headless Compatible? |
|-------|-----------|-------------|---------------------|
| **Image (VX)** | `imageDynamicTag` | Static HTML + PHP `render.php` | ⚠️ WordPress-only |
| **Gallery (VX)** | `imagesDynamicTag` | Plan C+ (vxconfig + React) | ⚠️ WordPress-only |
| **Slider (VX)** | `imagesDynamicTag` | Plan C+ (vxconfig + React) | ⚠️ WordPress-only |

---

## How Each Block Resolves Dynamic Tags (WordPress)

### Image Block — Static HTML via render.php

The Image block uses **pure static HTML** architecture. `save.tsx` outputs the final `<img>` tag directly; there is no React hydration. When `imageDynamicTag` is set and no static URL exists, `save.tsx` outputs a placeholder:

```html
<img src="" alt="" loading="lazy" data-dynamic-image="@tags()@term(image)@endtags()" class="..." />
```

`render.php` intercepts this at request time:

```
render.php
  ↓ Block_Renderer::render_expression("@tags()@term(image)@endtags()")
  ↓ strip @tags()...@endtags() wrapper → "96"
  ↓ wp_get_attachment_image_url(96, 'large') → "https://.../image.jpg"
  ↓ preg_replace(): replace <img src=""> with <img src="https://.../image.jpg">
  ↓ final HTML sent to browser (no JS needed)
```

**Reference:** `docs/block-conversions/dynamic-data/image-dynamic-tag-resolution.md`

---

### Gallery & Slider Blocks — vxconfig JSON patch via render.php

Gallery and Slider use **Plan C+**: `save.tsx` embeds a `<script class="vxconfig">` JSON blob; `frontend.tsx` reads it and React renders the images client-side. PHP never generates `<img>` tags directly.

`render.php` patches the JSON **before** it reaches the browser:

```
render.php
  ↓ Block_Renderer::render_expression("@tags()@term(gallery)@endtags()")
  ↓ strip wrapper → "96,97,98"  (comma-separated attachment IDs)
  ↓ for each ID: wp_get_attachment_image_url() + metadata → ProcessedImage[]
  ↓ preg_replace_callback(): parse <script class="vxconfig"> JSON
      config.images = [] → config.images = [{ id:96, src_display:..., ... }, ...]
  ↓ patched HTML sent to browser

Browser:
  ↓ frontend.tsx mounts → querySelector('script.vxconfig') → JSON.parse()
  ↓ normalizeImages() reads resolved images array
  ↓ React renders gallery/slider with real images
```

React never knows the images came from a dynamic tag — it sees a fully populated `images[]` array identical to manually uploaded images.

---

## Why This Is WordPress-Only

Both resolution strategies depend on WordPress PHP running at request time:

- `Block_Renderer::render_expression()` — requires WordPress context (term meta, `get_queried_object()`)
- `wp_get_attachment_image_url()` — WordPress media API
- `render.php` — only executes in the WordPress block rendering pipeline

In a **headless Next.js** context, WordPress never renders the page. The static HTML from `save.tsx` is fetched directly. For the Image block, this means the `data-dynamic-image` placeholder `<img>` is served as-is — empty `src`. For Gallery/Slider, `vxconfig.images` is empty (`[]`).

---

## Headless Resolution Path (Defined, Not Yet Implemented)

The REST API infrastructure needed for headless dynamic tag resolution **already exists** — it was built to power the Gutenberg editor preview.

### Existing Endpoint

```
POST /wp-json/voxel-fse/v1/dynamic-data/render
Body: {
  expression: "@tags()@term(image)@endtags()",
  preview_context: { type: "term", term_id: 42 }
}
Response: { expression: "...", rendered: "@tags()96@endtags()" }
```

The `build_preview_context()` method in `rest-api.php` already handles `term`, `post`, and `user` context types.

### Headless Implementation Plan (Future)

**Image block:**

```typescript
// Next.js: resolve dynamic image tag server-side (SSR/SSG)
async function resolveImageTag(expression: string, termId: number): Promise<string> {
  const result = await fetch('/wp-json/voxel-fse/v1/dynamic-data/render', {
    method: 'POST',
    body: JSON.stringify({ expression, preview_context: { type: 'term', term_id: termId } }),
  });
  const { rendered } = await result.json();

  // Strip @tags()...@endtags() wrapper
  const match = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
  const attachmentId = parseInt(match?.[1] ?? '', 10);

  // Fetch URL from WP media API
  const media = await fetch(`/wp/v2/media/${attachmentId}`).then(r => r.json());
  return media.source_url;
}
```

**Gallery/Slider blocks:**

```typescript
// Next.js: resolve dynamic images tag and build ProcessedImage[]
async function resolveGalleryTag(expression: string, termId: number, displaySize = 'medium'): Promise<ProcessedImage[]> {
  const result = await fetch('/wp-json/voxel-fse/v1/dynamic-data/render', {
    method: 'POST',
    body: JSON.stringify({ expression, preview_context: { type: 'term', term_id: termId } }),
  });
  const { rendered } = await result.json();

  // Strip wrapper, split comma-separated IDs
  const match = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
  const ids = (match?.[1] ?? '').split(',').map(Number).filter(Boolean);

  // Fetch each attachment
  return Promise.all(ids.map(async (id) => {
    const media = await fetch(`/wp/v2/media/${id}`).then(r => r.json());
    return {
      id,
      src_display: media.media_details?.sizes?.[displaySize]?.source_url ?? media.source_url,
      src_lightbox: media.media_details?.sizes?.large?.source_url ?? media.source_url,
      alt: media.alt_text ?? '',
      caption: media.caption?.rendered ?? '',
      title: media.title?.rendered ?? '',
    };
  }));
}
```

Both functions run at SSR/SSG time and pass resolved data into the block component as props — bypassing `render.php` and the `vxconfig` patch entirely.

---

## Architecture Comparison

```
WORDPRESS (current)
─────────────────────────────────────────────────
Request → WordPress renders page
  → render.php executes per-block
  → Block_Renderer resolves @term(image)
  → Image: <img src="resolved-url"> in HTML
  → Gallery/Slider: vxconfig.images = [resolved...]
  → Browser receives final HTML


HEADLESS NEXT.JS (future)
─────────────────────────────────────────────────
Build/Request → Next.js fetches WP REST API
  → GET /wp-json/wp/v2/pages/{id} (raw block HTML)
    OR fetch vxconfig from block attrs via WP Block Parser
  → For dynamic tags: POST /voxel-fse/v1/dynamic-data/render
  → Resolve attachment IDs → fetch /wp/v2/media/{id}
  → Pass resolved URLs as props to React components
  → Next.js renders final HTML (render.php never runs)
```

---

## Summary

| | WordPress | Headless (future) |
|---|---|---|
| **Image dynamic tag** | `render.php` replaces `<img src="">` placeholder | REST API resolves tag → pass `src` as prop |
| **Gallery/Slider dynamic tags** | `render.php` patches `vxconfig` JSON | REST API resolves tags → pass `images[]` as prop |
| **Infrastructure needed** | ✅ Already built | ✅ REST endpoint already exists (`/dynamic-data/render`) |
| **Work remaining** | None | Next.js integration layer |

The dynamic tag REST endpoint (`/voxel-fse/v1/dynamic-data/render`) was built for the Gutenberg editor preview — it is the same endpoint Next.js will use. No backend changes are needed for headless; only the Next.js data-fetching layer needs to be wired up.
