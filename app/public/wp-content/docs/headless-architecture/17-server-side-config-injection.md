# Server-Side Config Injection (SSR for Config-Fetching Blocks)

**Date:** February 2026
**Status:** Planned
**Affects:** search-form, create-post, navbar blocks
**Related:** [01-accelerated-option-c-plus-strategy.md](01-accelerated-option-c-plus-strategy.md), [14-css-generation-architecture.md](14-css-generation-architecture.md)

---

## The Problem

Three FSE blocks show a `.ts-loader` spinner on page load because they fetch **UI configuration** (not content) via REST API calls before they can render anything. This is a perceivable ~200-500ms delay that Voxel does not have.

| Block | REST Endpoint | Data Fetched | Spinner Duration |
|-------|---------------|-------------|-----------------|
| **search-form** | `GET voxel-fse/v1/search-form/frontend-config` | PostTypeConfig[] (filter definitions, labels, icons, props, values) | ~200-500ms |
| **create-post** | `GET voxel-fse/v1/create-post/fields-config` + `GET voxel-fse/v1/create-post/post-context` | VoxelField[] + PostContext (permissions, nonces) | ~300-600ms |
| **navbar** | `GET voxel-fse/v1/navbar/menu?location={loc}` | Menu item trees (only for `select_wp_menu` source) | ~100-300ms |

### Why Voxel Has No Spinner

Voxel renders the full UI server-side in PHP. For example, the search form uses a dual-form SSR pattern:

```html
<!-- Form 1: Vue.js form, hidden until Vue mounts -->
<form v-cloak>...</form>

<!-- Form 2: PHP-rendered fallback, visible instantly -->
<form v-if="false">
  <?php foreach ($filters as $filter): ?>
    <?php $filter->_ssr_filters(); ?>  <!-- Full HTML rendered server-side -->
  <?php endforeach; ?>
</form>
```

The PHP renders actual filter HTML with labels, icons, and structure. When Vue.js mounts, it swaps Form 1 in and removes Form 2. The user sees a fully-rendered form instantly.

### Why Our FSE Blocks Show a Spinner

Our blocks use the Plan C+ architecture where:
1. `save.tsx` stores minimal config in `vxconfig` (post type keys, settings)
2. `frontend.tsx` reads vxconfig, then makes a REST API call to get full config
3. During the REST call, a `.ts-loader` spinner is shown
4. After data arrives, React renders the full UI

The vxconfig intentionally stores **minimal** data to avoid staleness (filter definitions can change in Voxel admin). But this creates a visible loading gap.

---

## The Solution: Server-Side Config Injection

Inject the full configuration data inline during PHP rendering, so `frontend.tsx` can read it immediately without making a REST API call.

### How It Works

The `render_block` filter in `Block_Loader.php` already runs for every block on every page load. It already modifies block HTML to inject CSS styles (via `apply_search_form_styles()`, `apply_map_styles()`, etc.). We extend this same mechanism to also inject configuration data.

```
┌──────────────────────────────────────────────────────┐
│ WordPress Page Load                                  │
│                                                      │
│ 1. save.tsx HTML loaded from database                │
│    └── Contains: <script class="vxconfig">           │
│        (minimal: post type keys, settings)           │
│                                                      │
│ 2. render_block filter (PHP, per-request)            │
│    └── NEW: Calls controller static method           │
│    └── NEW: Injects <script class="vxconfig-hydrate">│
│        (full: filter data, labels, icons, props)     │
│                                                      │
│ 3. frontend.tsx (JavaScript)                         │
│    └── Reads vxconfig-hydrate inline data            │
│    └── If found: use immediately (NO spinner)        │
│    └── If not found: fall back to REST API           │
└──────────────────────────────────────────────────────┘
```

### Data Flow Comparison

```
BEFORE:
  Page HTML ──→ frontend.tsx ──→ REST API call ──→ [spinner] ──→ Render

AFTER (WordPress):
  Page HTML (with inline config) ──→ frontend.tsx ──→ Read inline ──→ Render (instant)

AFTER (Next.js / Headless):
  GraphQL query ──→ Server Component ──→ Render (instant, different code path)
```

---

## Architecture Alignment with C+

This solution is fully aligned with the [Accelerated Option C+ Strategy](01-accelerated-option-c-plus-strategy.md):

### The C+ Architecture (from 01-accelerated-option-c-plus-strategy.md)

```
┌─────────────────────────────────────────────────────────┐
│ WordPress (Editor): edit.tsx (Configuration)            │
│ Next.js (Frontend): React Component (Consumption)      │
│ Transitional Shim:  render.php + save.tsx (PHP Preview) │
└─────────────────────────────────────────────────────────┘
```

The C+ strategy explicitly states:
- `render.php` / `render_block` is the **transitional shim** for PHP preview
- Next.js **ignores** all PHP output (render.php, save.tsx, render_block modifications)
- Next.js gets data via **GraphQL attributes**, not from inline scripts

### Where This Fits

| Layer | WordPress (Now) | Next.js (Future) |
|-------|----------------|------------------|
| **Config Source** | `render_block` filter injects inline JSON | GraphQL `attributes` prop |
| **Config Format** | `<script class="vxconfig-hydrate">` | React component props |
| **Rendering** | `frontend.tsx` reads inline + React mount | Server Component (SSR) |
| **Spinner** | None (data is inline) | None (data is server-side) |

The inline config injection is purely a **WordPress optimization** in the transitional layer. It has zero impact on the headless architecture because:

1. Next.js never sees `render_block` output
2. Next.js components receive data via GraphQL, not DOM parsing
3. The `frontend.tsx` REST API fallback is preserved for any edge case

---

## Implementation Details

### PHP Side: Static Method Extraction

Each controller's REST handler is refactored into:
- A **static method** that generates the config data (reusable)
- A **thin REST wrapper** that calls the static method and returns a response

```php
// Before: tightly coupled to REST request
public function get_frontend_config(\WP_REST_Request $request) {
    $post_types_param = $request->get_param('post_types');
    // ... 100 lines of data gathering ...
    return rest_ensure_response($result);
}

// After: reusable static method + thin wrapper
public static function generate_frontend_config(array $keys, array $filter_configs = []): array {
    // ... same data gathering logic, no REST dependency ...
    return $result;
}

public function get_frontend_config(\WP_REST_Request $request) {
    $keys = explode(',', $request->get_param('post_types') ?? '');
    $filter_configs = $request->get_json_params()['filter_configs'] ?? [];
    return rest_ensure_response(self::generate_frontend_config($keys, $filter_configs));
}
```

### PHP Side: Block_Loader Injection

```php
// In apply_voxel_tab_features(), after existing style injection:
if ($block_name === 'search-form' && $block_id) {
    $block_content = self::apply_search_form_styles($block_content, $attributes, $block_id);
    $block_content = self::inject_search_form_config($block_content, $attributes);
}

// New method:
private static function inject_search_form_config($block_content, $attributes) {
    $post_type_keys = $attributes['postTypes'] ?? [];
    if (empty($post_type_keys)) return $block_content;

    // Transform filterLists to filter_configs format
    $filter_configs = self::transform_filter_lists($attributes['filterLists'] ?? []);

    // Call the controller's static method (same logic as REST endpoint)
    require_once dirname(__DIR__) . '/controllers/fse-search-form-controller.php';
    $config = \VoxelFSE\Controllers\FSE_Search_Form_Controller::generate_frontend_config(
        $post_type_keys, $filter_configs
    );

    return self::inject_inline_config($block_content, $config);
}

// Shared injection helper:
private static function inject_inline_config($block_content, $data) {
    $json = wp_json_encode($data);
    $script = '<script type="text/json" class="vxconfig-hydrate">' . $json . '</script>';
    $pos = strrpos($block_content, '</div>');
    if ($pos !== false) {
        $block_content = substr_replace($block_content, $script, $pos, 0);
    }
    return $block_content;
}
```

### TypeScript Side: Inline Data Reading

```typescript
// In init function, before React mount:
const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
let inlineData: PostTypeConfig[] | null = null;
if (hydrateScript?.textContent) {
    try { inlineData = JSON.parse(hydrateScript.textContent); } catch {}
}

// In wrapper component:
function SearchFormWrapper({ attributes, onSubmit, inlinePostTypes }: Props) {
    const [postTypes, setPostTypes] = useState<PostTypeConfig[]>(inlinePostTypes || []);
    const [isLoading, setIsLoading] = useState(!inlinePostTypes);

    useEffect(() => {
        // Skip fetch if we have inline data
        if (inlinePostTypes && inlinePostTypes.length > 0) return;

        // Fallback: REST API fetch (for headless or edge cases)
        async function loadPostTypes() { /* existing logic */ }
        loadPostTypes();
    }, []);
    // ...
}
```

---

## Block-Specific Notes

### Search Form

- **Data:** PostTypeConfig[] with filter definitions
- **Source:** `FSE_Search_Form_Controller::generate_frontend_config()`
- **Freshness:** Filter definitions change when admin edits post type config. The inline data is always fresh because it's generated per-request (not cached in database).
- **Size:** ~5-20KB depending on number of post types and filters

### Create Post

- **Data:** VoxelField[] + PostContext
- **Source:** `FSE_Create_Post_Controller::generate_fields_config()` + `generate_post_context()`
- **User-specific:** PostContext includes permissions, nonces, and post status for the current user. This works because `render_block` runs per-request with the current user's session.
- **URL-dependent:** `post_id` from URL params (`$_GET['post_id']`) determines edit mode vs. create mode.
- **Auth-gated:** Only inject when `is_user_logged_in()` (create-post requires authentication).
- **Size:** ~10-50KB depending on number of fields

### Navbar

- **Data:** NavbarMenuApiResponse (menu item trees)
- **Source:** `FSE_Navbar_API_Controller::generate_menu_items()`
- **Conditional:** Only inject when `source === 'select_wp_menu'`. For `add_links_manually`, data is already in vxconfig.
- **Size:** ~2-10KB depending on menu depth

---

## Performance Considerations

### Per-Request PHP Cost

The inline injection adds PHP processing on every page load. However:
- The same data would be fetched via REST API anyway (just deferred to client-side)
- A PHP function call is ~10-50ms vs. a full HTTP REST round-trip of ~200-500ms
- The data generation is the same code path either way
- Page caches (if enabled) will cache the full HTML including inline config

### Caching Behavior

| Cache Layer | Behavior |
|-------------|----------|
| **No cache** | PHP generates inline data per-request (always fresh) |
| **Page cache** (e.g., WP Super Cache) | Inline data is cached with the HTML. Cache invalidation on config change needed. |
| **Object cache** (e.g., Redis) | Can be added to the static method for faster repeated generation |
| **CDN** | Same as page cache; purge on config change |

### Data Freshness

The inline data is always fresh because it's generated per-request from Voxel's live configuration. This is identical to Voxel's SSR approach. If a page cache is used, the inline data becomes stale when Voxel config changes, but this is the same trade-off every SSR system makes.

---

## Migration Path

### Phase 1: Search Form (highest visibility, above the fold)
### Phase 2: Create Post (authenticated pages, user-specific data)
### Phase 3: Navbar (menu data, conditional injection)

Each phase is independent and can be deployed separately. The REST API endpoints remain unchanged and continue to work as fallback.

---

## Blocks That Do NOT Need This Fix

These blocks fetch **dynamic content** (not config) and correctly use client-side loading:

| Block | What It Fetches | Loading Pattern | Correct? |
|-------|----------------|----------------|----------|
| **post-feed** | Search results / posts | Opacity/skeleton on AJAX refresh | Yes (Voxel does the same) |
| **messages** | Chat messages | Loading on mount | Yes (real-time data) |
| **timeline** | Timeline feed | Loading on mount | Yes (paginated content) |
| **map** | Marker data | Tied to search events | Yes (dynamic) |
| **term-feed** | Term listings | Loading on mount | Yes (query-based) |
