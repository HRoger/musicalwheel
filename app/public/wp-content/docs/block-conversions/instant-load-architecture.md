# Instant Load Architecture — Block Server-Side Hydration

**Date:** February 2026
**Status:** ✅ Complete — search-form, term-feed, post-feed (all instant)

---

## Problem

Several FSE blocks showed a loading spinner on initial page load because they
fetched their data via REST API or Voxel AJAX on mount. This was unnecessary for
the **first paint** — all the data was available server-side at PHP render time.

Affected blocks and resolution:

| Block | First-paint data | Old behaviour | New behaviour |
|-------|-----------------|---------------|---------------|
| `search-form` | Post types + filter configs | REST `GET /search-form/config` → spinner | Injected by PHP → instant |
| `term-feed` | Rendered term card HTML | REST `GET /term-feed/terms` → spinner | Injected by PHP → instant |
| `post-feed` | Rendered post card HTML | Voxel AJAX `?vx=1` → blank space / spinner | Injected by PHP → instant |

---

## Core Pattern

### 1. PHP injection at render time (`Block_Loader.php`)

During `render_block`, `Block_Loader` calls a block-specific injection method
that gathers data using the same PHP logic as the REST endpoint, then appends
a `<script type="text/json" class="vxconfig-hydrate">` tag inside the block's
HTML output.

```
WordPress renders page
  └─ Block_Loader::apply_voxel_tab_features()   [render_block priority 10]
       └─ inject_{block}_config($block_content, $attributes)
            └─ {Controller}::generate_frontend_config($attributes)
                 └─ inject_inline_config($block_content, $data)
                      └─ <script type="text/json" class="vxconfig-hydrate">…</script>
```

### 2. JS reads hydrated data synchronously (`frontend.tsx`)

```
Browser loads page
  └─ initBlocks() / initTermFeeds() / initSearchForms()
       └─ container.querySelector('script.vxconfig-hydrate')   ← DOM read, no network
       └─ JSON.parse(hydrateScript.textContent)
       └─ inlineData populated
       └─ Component renders immediately (isLoading = false)
       └─ useEffect REST/AJAX fetch is SKIPPED
```

### 3. Fallback

If `vxconfig-hydrate` is missing or JSON is malformed, the block falls back to
the REST API / AJAX fetch with a loading spinner. Graceful degradation is preserved.

---

## Implementation per Block

### `search-form`

**PHP side:**
- `Block_Loader::inject_search_form_config()` (line ~6301)
- Calls `FSE_Search_Form_Controller::generate_frontend_config($post_type_keys, $filter_configs)`
- Injects `PostTypeConfig[]` — post types with filter definitions and icons

**JS side (`search-form/frontend.tsx`):**
```typescript
let inlinePostTypes: PostTypeConfig[] | null = null;
const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
if (hydrateScript?.textContent) {
    inlinePostTypes = JSON.parse(hydrateScript.textContent);
}
// SearchFormWrapper: isLoading = !inlinePostTypes || inlinePostTypes.length === 0
// useEffect: skipped when inlinePostTypes && inlinePostTypes.length > 0
```

---

### `term-feed`

**PHP side:**
- `Block_Loader::inject_term_feed_config()`
- Calls `FSE_Term_Feed_Controller::generate_frontend_config($attributes)` (static method)
- Supports both `filters` and `manual` source modes
- Injects `{ terms: TermData[], total: number, styles: string }`
- **CRITICAL:** Does NOT call `get_rendered_block_styles()` (which calls `wp_print_styles()`).
  That function outputs CSS directly and must never be called during a `render_block` filter.
  NectarBlocks CSS (`get_nectar_blocks_css()`) is safe — it reads from post meta only.

**JS side (`term-feed/frontend.tsx`):**
```typescript
let inlineTerms: TermData[] | null = null;
const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
if (hydrateScript?.textContent) {
    const hydrated = JSON.parse(hydrateScript.textContent);
    if (Array.isArray(hydrated.terms)) {
        inlineTerms = hydrated.terms as TermData[];
        // Inject NectarBlocks CSS from hydrated.styles if present
    }
}
// TermFeedWrapper: isLoading = (inlineTerms == null)
// useEffect: skipped when inlineTerms != null
```

---

### `post-feed` — ✅ SSR via do_blocks()

**Why it works (correcting previous incorrect assumptions):**

The FSE child theme does NOT use Elementor. Post cards are FSE block templates
rendered via `do_blocks()`. The Elementor plugin is **deactivated**. Voxel's
`\Voxel\print_template()` and `\Elementor\Plugin` are never used.

Card templates are FSE templates (e.g., `voxel-place-card`) managed via the
WordPress Site Editor at paths like:
`/wp-admin/site-editor.php?canvas=edit&p=/wp_template/voxel-fse//voxel-place-card`

**PHP side:**
- `Block_Loader::inject_post_feed_config()`
- Calls `FSE_Post_Feed_Controller::generate_frontend_config($attributes)` (static method)
- Supports all source modes: `search-form`, `search-filters`, `manual`, `archive`
- Uses Voxel's query system (`$post_type->query()`) to get post IDs
- Renders each card via `do_blocks($fse_template_content)` with proper Voxel post context
- NB SSR context is set for blocks without render callbacks (star-rating, icon)
- Injects `{ html, hasResults, hasPrev, hasNext, totalCount, displayCount }`

**JS side (`post-feed/frontend.tsx` + `PostFeedComponent.tsx`):**
```typescript
// frontend.tsx: Parse hydrated data before mounting
const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
if (hydrateScript?.textContent) {
    const hydrated = JSON.parse(hydrateScript.textContent);
    initialHtml = hydrated.html;
    initialMeta = { hasResults, hasPrev, hasNext, totalCount, displayCount };
}

// PostFeedComponent.tsx: Start with hydrated state (no loading spinner)
const [state, setState] = useState<PostFeedState>(() => {
    if (isHydrated && initialMeta) {
        return { loading: false, results: initialHtml, ...initialMeta };
    }
    return { loading: true, results: '' };
});

// useEffect: skips initial fetch when isHydrated is true
```

**Source mode handling:**

| Source | SSR Support | Notes |
|--------|------------|-------|
| `search-filters` | ✅ Full | Replicates Voxel's `set_elementor_config()` / `get_default_value_from_elementor()` lifecycle |
| `manual` | ✅ Full | Renders specified post IDs |
| `archive` | ✅ Full | Queries by post type |
| `search-form` | ✅ Partial | Works when `postType` is set in attributes. Falls back to AJAX when postType must be derived from linked search form on the client side. |

---

## Editor Config Injection (Eliminates Editor Spinners)

In the Gutenberg editor, blocks fetch config data (post types, taxonomies, etc.)
via REST API on mount, causing a brief spinner. This is eliminated by injecting
the data inline via `wp_add_inline_script()`.

### `Block_Loader::inject_editor_config_data()`

Sets `window.__voxelFseEditorConfig` with pre-computed config for all blocks:

```javascript
window.__voxelFseEditorConfig = {
    searchForm: [...],           // PostTypeConfig[] — all Voxel post types with filters
    createPostFields: {...},     // Field configs keyed by post type
    navbarLocations: [...],      // Registered menu locations
    termFeed: {                  // Taxonomies, post types, card templates
        taxonomies: [...],
        postTypes: [...],
        cardTemplates: [...]
    },
    postFeed: {                  // Post types and REST config
        postTypes: [...],
        ajaxUrl: '...',
        restUrl: '...'
    }
};
```

**Blocks using inline editor config:**
- `search-form` → `usePostTypes.ts` reads `__voxelFseEditorConfig.searchForm`
- `create-post` → `useFieldsConfig.ts` reads `__voxelFseEditorConfig.createPostFields`
- `navbar` → `edit.tsx` reads `__voxelFseEditorConfig.navbarLocations`
- `term-feed` → `edit.tsx` reads `__voxelFseEditorConfig.termFeed`
- `post-feed` → `usePostFeedConfig.ts` reads `__voxelFseEditorConfig.postFeed`

---

## Shared Infrastructure

### `Block_Loader::inject_inline_config()`

Single reusable injector used by all blocks:

```php
private static function inject_inline_config($block_content, $data): string
{
    // JSON_HEX_TAG: encodes < → \u003c and > → \u003e
    // Prevents NectarBlocks' accessible_svgs render_block filter from
    // injecting role="none" into <svg> tags inside the JSON string,
    // which would corrupt JSON.parse() on the frontend.
    $json = wp_json_encode($data, JSON_HEX_TAG);

    $script = '<script type="text/json" class="vxconfig-hydrate">' . $json . '</script>';

    // Insert before last </div> (the block's closing wrapper)
    $pos = strrpos($block_content, '</div>');
    if ($pos !== false) {
        $block_content = substr_replace($block_content, $script, $pos, 0);
    }
    return $block_content;
}
```

### `JSON_HEX_TAG` — Why It's Mandatory

NectarBlocks registers a `render_block` filter that scans block HTML for `<svg`
tags missing a `role` attribute and injects `role="none"`. When a search-form or
term-feed block is nested inside a NectarBlocks container, the parent block's
`render_block` filter runs on the combined HTML — including our JSON payload.

Without `JSON_HEX_TAG`, the regex finds `<svg` inside the JSON string and
injects `role="none"` with **unescaped** double quotes, corrupting the JSON:

```
// Broken (without JSON_HEX_TAG):
"icon":"<svg role="none" aria-hidden=\"true\""
//             ↑ breaks JSON.parse — unescaped " terminates the string value
```

With `JSON_HEX_TAG`, `<` is encoded as `\u003c`, so no `<svg` pattern exists
inside the JSON string. `JSON.parse()` transparently decodes `\u003c` back to
`<` — the data is byte-for-byte identical.

---

## ⚠️ Critical Rule: Never Call `wp_print_styles()` in `render_block`

`wp_print_styles()` **echoes** CSS directly to the output buffer. Calling it
from inside a `render_block` filter fires before `wp_head()`, which inserts
styles at the beginning of the page body — before `<html>` and `<head>` —
breaking the entire HTML structure (page appears as raw unstyled text).

**Safe operations during `render_block`:**
- `wp_enqueue_style()` — queues a stylesheet for `wp_head()` (safe)
- Database reads (`get_post_meta`, `$wpdb->get_col`) — safe
- `do_blocks()` — safe (returns string, no direct output)

**Forbidden during `render_block`:**
- `wp_print_styles()` — echoes output ❌
- `wp_print_scripts()` — echoes output ❌
- `ob_start()` + `wp_print_styles()` inside `render_block` — same problem ❌

---

## Files

| File | Role |
|------|------|
| `app/blocks/Block_Loader.php` | `inject_inline_config()`, `inject_search_form_config()`, `inject_term_feed_config()`, `inject_post_feed_config()`, `inject_editor_config_data()` |
| `app/controllers/fse-search-form-controller.php` | `generate_frontend_config()` (static) |
| `app/controllers/fse-term-feed-controller.php` | `generate_frontend_config()` (static) |
| `app/controllers/fse-post-feed-controller.php` | `generate_frontend_config()` (static) |
| `app/blocks/src/search-form/frontend.tsx` | Reads `vxconfig-hydrate`, skips REST when present |
| `app/blocks/src/search-form/hooks/usePostTypes.ts` | Reads `__voxelFseEditorConfig.searchForm` for editor |
| `app/blocks/src/term-feed/frontend.tsx` | Reads `vxconfig-hydrate`, skips REST when present |
| `app/blocks/src/term-feed/edit.tsx` | Reads `__voxelFseEditorConfig.termFeed` for editor |
| `app/blocks/src/post-feed/frontend.tsx` | Reads `vxconfig-hydrate`, passes to component |
| `app/blocks/src/post-feed/shared/PostFeedComponent.tsx` | Uses `initialHtml`/`initialMeta` props for instant render |
| `app/blocks/src/post-feed/hooks/usePostFeedConfig.ts` | Reads `__voxelFseEditorConfig.postFeed` for editor |

---

## Backend (Editor) — Search Form Memoization

The Gutenberg editor had a separate issue: `usePostTypes` refetched on every
style attribute change (slider drag, popup width) because the `attributes`
object reference changed, making `filterLists` appear to change too.

**Fix:** `edit.tsx` uses `useMemo` to produce a stable filter config that only
changes when *functional* filter properties change (not style properties):

```typescript
const stableFilterConfigs = useMemo(() => {
    // Only include functional properties — excludes popupWidth, labelColor, etc.
    return mapFilterListsToFunctionalKeys(attributes.filterLists);
}, [attributes.filterLists]);

const { postTypes, isLoading } = usePostTypes({ filterConfigs: stableFilterConfigs });
```

Dragging a width slider changes `attributes.searchButtonWidth` — not in the
`useMemo` deps — so `stableFilterConfigs` keeps its reference and `usePostTypes`
does not refetch.
