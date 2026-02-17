# Navbar ↔ Search-Form Connection - Parity Audit

**Date:** February 10, 2026
**Status:** NOT WORKING on frontend (editor-only)
**Overall Parity:** ~30% (editor linking works, frontend connection completely broken)

---

## 1. Executive Summary

The Voxel parent theme has a tight, bidirectional connection between the navbar widget and search-form widget for post-type switching. The FSE implementation has editor-side block discovery working, but the **frontend connection is completely broken** due to 3 cascading issues:

1. **`save.tsx` doesn't serialize `searchFormId` to vxconfig** - the linked block ID is lost at save time
2. **`frontend.tsx` doesn't pass `linkedPostTypes` or `linkedBlockId`** to NavbarComponent - so the search_form source renders a "link widget to use" placeholder on the frontend
3. **Search-form has no `voxel-switch-post-type` event listener** - even if the navbar dispatched the event, nobody is listening

---

## 2. How Voxel Does It (Working Reference)

### 2.1 Widget Linking (Elementor)

**File:** `themes/voxel/app/widgets/navbar.php:105-113`
```php
$this->add_control( 'ts_search_widget', [
    'type' => 'voxel-relation',
    'vx_group' => 'searchToNavbar',
    'vx_target' => 'elementor-widget-ts-search-form',
    'vx_side' => 'right',
    'condition' => [ 'navbar_choose_source' => 'search_form' ],
] );
```

Voxel uses a custom `voxel-relation` Elementor control. Relations are stored in `_voxel_page_settings` post meta and resolved at runtime via `get_related_widget()`.

### 2.2 Navbar Render (PHP Server-Side)

**File:** `themes/voxel/templates/widgets/navbar.php:46-79`

1. Calls `\Voxel\get_related_widget($this, $template_id, 'searchToNavbar', 'right')` to find the linked search form
2. Instantiates the search form widget from config
3. Reads `ts_choose_post_types` to get the post type list
4. Gets the default post type via `_get_default_post_type()`
5. Renders `<li>` items with `data-post-type="{key}"` attributes
6. Adds `.current-menu-item` to the active post type
7. Wraps in `<nav class="ts-nav-sf ts-nav-sf-{widget_id}">`

**Key:** The `ts-nav-sf-{widget_id}` class is critical - it scopes the navbar to its specific linked search form.

### 2.3 Search Form JavaScript (Frontend)

**File:** `voxel-search-form.beautified.js:2360-2373`

```javascript
handleNavbars() {
    // Search form reaches INTO the navbar DOM using the widget_id class
    jQuery(`.ts-nav-sf-${this.widget_id} .ts-item-link`).on("click", (e) => {
        e.preventDefault();
        let postType = e.currentTarget.parentElement.dataset.postType;
        this.setPostType(postType);
    });

    // Bidirectional: watch post_type changes and update navbar active state
    this.$watch("post_type", () => {
        jQuery(`.ts-nav-sf-${this.widget_id} .menu-item[data-post-type="${this.post_type.key}"]`)
            .addClass("current-menu-item")
            .siblings()
            .removeClass("current-menu-item");
    });
}
```

Called from `created()` hook via `this.$nextTick(this.handleNavbars)`.

### 2.4 Complete Voxel Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ELEMENTOR EDITOR                                            │
│    User links navbar → search-form via voxel-relation control  │
│    Stored in: _voxel_page_settings.relations.searchToNavbar    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. NAVBAR PHP RENDER                                           │
│    get_related_widget() → finds search-form config             │
│    Reads post types, renders <li data-post-type="places">      │
│    Nav class: .ts-nav-sf-{search_form_widget_id}               │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. SEARCH FORM JS (Vue)                                        │
│    created() → this.$nextTick(this.handleNavbars)              │
│    handleNavbars() attaches jQuery click handler to:            │
│      .ts-nav-sf-{widget_id} .ts-item-link                     │
│    Click → reads data-post-type → this.setPostType(key)        │
│    $watch → updates .current-menu-item class on navbar <li>    │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** In Voxel, the **search form** drives the connection. It reaches into the navbar DOM to attach click handlers. The navbar just renders static HTML with `data-post-type` attributes.

---

## 3. How FSE Does It (Current State)

### 3.1 Editor Linking (Working)

**File:** `navbar/edit.tsx:144-163`

The navbar uses `useSelect` + `findBlockById()` to discover the linked search-form block in the editor:

```typescript
if (attributes.source === 'search_form' && attributes.searchFormId) {
    const allBlocks = getBlocks();
    const linkedBlock = findBlockById(allBlocks, attributes.searchFormId);
    if (linkedBlock?.attributes?.postTypes) {
        const postTypes = linkedBlock.attributes.postTypes.map(/*...*/);
        return { linkedPostTypes: postTypes, linkedBlockId: linkedBlock.attributes.blockId };
    }
}
```

The `searchFormId` is set via `BlockRelationControl` in ContentTab inspector (`ContentTab.tsx:274-276`).

**Status:** WORKING in editor. Post-type links render correctly in the editor preview.

### 3.2 Save (BROKEN - Data Loss)

**File:** `navbar/save.tsx:67-88`

The vxConfig object serialized to the save output does NOT include `searchFormId`:

```typescript
const vxConfig: NavbarVxConfig = {
    source: attributes.source,
    menuLocation: attributes.menuLocation,
    // ... other properties ...
    // ❌ searchFormId: NOT INCLUDED
    // ❌ templateTabsId: NOT INCLUDED
};
```

Even though `NavbarVxConfig` type definition includes `searchFormId` (types/index.ts:168), save.tsx doesn't write it.

### 3.3 Frontend (BROKEN - No Data)

**File:** `navbar/frontend.tsx:419-428`

The `NavbarWrapper` renders `NavbarComponent` without `linkedPostTypes` or `linkedBlockId`:

```typescript
<NavbarComponent
    attributes={attributes}
    menuData={menuData}
    mobileMenuData={mobileMenuData}
    isLoading={isLoading}
    error={error}
    context="frontend"
    // ❌ linkedPostTypes: NOT PROVIDED
    // ❌ linkedBlockId: NOT PROVIDED
/>
```

### 3.4 Server-Side Config Injection (SKIPPED)

**File:** `Block_Loader.php:6042-6044`

```php
$source = $attributes['source'] ?? 'add_links_manually';
if ($source !== 'select_wp_menu') {
    return $block_content;  // ← Early return for search_form source!
}
```

The `inject_navbar_config()` only handles `select_wp_menu` source. Search form and template tabs sources get no server-side data.

### 3.5 NavbarComponent (RENDERS PLACEHOLDER)

**File:** `NavbarComponent.tsx:547-568`

On the frontend, `linkedPostTypes` is `undefined`, so it falls into the placeholder branch:

```typescript
if (attributes.source === 'search_form') {
    if (!linkedPostTypes || linkedPostTypes.length === 0) {
        // Shows "Search Form (link widget to use)" placeholder
        return (<nav>...<span>Search Form (link widget to use)</span>...</nav>);
    }
```

### 3.6 Search Form (NO LISTENER)

**Files:** `search-form/shared/SearchFormComponent.tsx`, `search-form/frontend.tsx`

Grep for `voxel-switch-post-type` in the search-form directory returns **zero results**. The event dispatched by NavbarComponent.tsx:592 is never consumed.

### 3.7 Current FSE Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GUTENBERG EDITOR                                            │
│    ✅ User links navbar → search-form via BlockRelationControl │
│    ✅ searchFormId stored in block attributes                  │
│    ✅ useSelect discovers linked block, extracts postTypes     │
│    ✅ NavbarComponent renders post-type links in editor        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SAVE                                                        │
│    ❌ searchFormId NOT serialized to vxconfig JSON             │
│    ❌ Post type data NOT serialized                            │
│    Result: vxconfig has source='search_form' but no link data  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND RENDER                                             │
│    ❌ Block_Loader skips injection for non-wp_menu sources     │
│    ❌ frontend.tsx doesn't resolve searchFormId to post types  │
│    ❌ NavbarComponent receives no linkedPostTypes              │
│    ❌ Shows "Search Form (link widget to use)" placeholder     │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. SEARCH FORM                                                 │
│    ❌ No listener for 'voxel-switch-post-type' event           │
│    ❌ No active state sync back to navbar                      │
│    Result: Even if navbar worked, search form wouldn't respond │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Gap Analysis

| # | Component | Voxel | FSE | Status |
|---|-----------|-------|-----|--------|
| 1 | Editor linking | voxel-relation control | BlockRelationControl + useSelect | ✅ Working |
| 2 | Post types data at save | Stored in page settings | **Not serialized to vxconfig** | ❌ Broken |
| 3 | Server-side post type resolution | `get_related_widget()` + PHP render | **inject_navbar_config skips search_form** | ❌ Missing |
| 4 | Frontend post-type rendering | PHP `<li data-post-type>` items | **Placeholder shown instead** | ❌ Broken |
| 5 | Click handler | jQuery on `.ts-nav-sf-{id} .ts-item-link` | CustomEvent dispatch (code exists but unreachable) | ❌ Unreachable |
| 6 | Post type switch | `this.setPostType(key)` | **No event listener in search-form** | ❌ Missing |
| 7 | Active state sync (navbar→) | `.current-menu-item` class in PHP | React state `postType.isActive` | ✅ Editor only |
| 8 | Active state sync (←search form) | `$watch('post_type')` + jQuery `.addClass` | **Not implemented** | ❌ Missing |
| 9 | `ts-nav-sf-{id}` scoping class | Yes (widget_id) | **Missing** (only `.ts-nav-sf`) | ❌ Missing |
| 10 | Default post type | `_get_default_post_type()` with URL `?type=` | First in array | ⚠️ Partial |

---

## 5. What Needs to Be Fixed

### Fix 1: Server-Side Post Type Resolution (Block_Loader.php)

The `inject_navbar_config()` method needs to handle `search_form` source by:
1. Reading `searchFormId` from navbar block attributes
2. Finding the search-form block on the page
3. Reading its `postTypes` attribute
4. Resolving post type labels/icons from Voxel's `Post_Type` registry
5. Injecting the resolved data as `vxconfig-hydrate`

```php
// In inject_navbar_config():
if ($source === 'search_form') {
    $search_form_id = $attributes['searchFormId'] ?? '';
    // Find the search-form block, read its postTypes attribute
    // Resolve labels/icons from \Voxel\Post_Type::get($key)
    // Inject as inline config
}
```

### Fix 2: Frontend NavbarWrapper (frontend.tsx)

The `NavbarWrapper` needs to:
1. Read `searchFormId` from vxconfig (or inline data)
2. Read the inline hydration data which contains resolved post types
3. Pass `linkedPostTypes` and `linkedBlockId` to `NavbarComponent`

### Fix 3: Save.tsx - Serialize searchFormId

Add `searchFormId` and `templateTabsId` to the vxconfig output:

```typescript
const vxConfig: NavbarVxConfig = {
    // ...existing...
    searchFormId: attributes.searchFormId,
    templateTabsId: attributes.templateTabsId,
};
```

### Fix 4: Search-Form Event Listener (SearchFormComponent.tsx)

Add a `voxel-switch-post-type` event listener in `SearchFormComponent.tsx` alongside the existing `voxel-search-clear` listener:

```typescript
useEffect(() => {
    if (context !== 'frontend') return;

    const handlePostTypeSwitch = (event: Event) => {
        const { searchFormId, postType } = (event as CustomEvent).detail || {};
        if (searchFormId !== attributes.blockId) return;
        if (postType) setCurrentPostType(postType);
    };

    window.addEventListener('voxel-switch-post-type', handlePostTypeSwitch);
    return () => window.removeEventListener('voxel-switch-post-type', handlePostTypeSwitch);
}, [context, attributes.blockId, setCurrentPostType]);
```

### Fix 5: Bidirectional Active State Sync

When the search form changes post type (from its own UI or programmatically), it should dispatch an event back so the navbar can update `.current-menu-item`:

```typescript
// In search-form: after setCurrentPostType
window.dispatchEvent(new CustomEvent('voxel-post-type-changed', {
    detail: { searchFormId: attributes.blockId, postType: newKey }
}));
```

```typescript
// In navbar frontend: listen and update active state
window.addEventListener('voxel-post-type-changed', (event) => {
    // Update which <li> has .current-menu-item
});
```

### Fix 6: Add `ts-nav-sf-{id}` Scoping Class

NavbarComponent.tsx:578 needs the dynamic class:
```tsx
<nav className={`ts-nav-menu ts-nav-sf ts-nav-sf-${linkedBlockId || ''} flexify`}>
```

---

## 6. Architecture Comparison

| Aspect | Voxel | FSE (should be) |
|--------|-------|-----------------|
| Link storage | `_voxel_page_settings.relations` | Block attribute `searchFormId` |
| Post type resolution | PHP at render time via `get_related_widget()` | PHP in `Block_Loader::inject_navbar_config()` |
| Post type data delivery | PHP template loops over `Post_Type` objects | Server-side hydration JSON via `vxconfig-hydrate` |
| Click event | jQuery delegation via `.ts-nav-sf-{id}` selector | `CustomEvent('voxel-switch-post-type')` |
| Event direction | Search form → navbar DOM (pull model) | Navbar → search form (push model via events) |
| Active state sync | `$watch('post_type')` + jQuery `.addClass` | Bidirectional events needed |
| Scoping mechanism | `.ts-nav-sf-{widget_id}` CSS class | `searchFormId` in event detail |

**Note:** The FSE architecture (push via CustomEvents) is actually cleaner than Voxel's (pull via jQuery DOM manipulation), but it requires both sides to implement their listeners.

---

## 7. Priority & Effort Estimate

| Fix | Priority | Files to Modify |
|-----|----------|----------------|
| Fix 3: save.tsx serialize searchFormId | **Critical** | `save.tsx` |
| Fix 1: Block_Loader server-side resolution | **Critical** | `Block_Loader.php` |
| Fix 2: frontend.tsx pass linked data | **Critical** | `frontend.tsx` |
| Fix 4: Search-form event listener | **Critical** | `SearchFormComponent.tsx` |
| Fix 5: Bidirectional active state | **Medium** | `SearchFormComponent.tsx`, `NavbarComponent.tsx` or `frontend.tsx` |
| Fix 6: `ts-nav-sf-{id}` class | **Low** | `NavbarComponent.tsx` |

All 4 critical fixes must be done together for the connection to work end-to-end.

---

## 8. Source Files Referenced

### Voxel Parent (READ-ONLY)
| File | Lines | Content |
|------|-------|---------|
| `widgets/navbar.php` | 105-113 | voxel-relation control |
| `templates/widgets/navbar.php` | 46-79 | search_form template branch |
| `app/utils/template-utils.php` | 190-220 | `get_related_widget()` |
| `voxel-search-form.beautified.js` | 2360-2373 | `handleNavbars()` method |
| `voxel-search-form.beautified.js` | 2016-2017 | `setPostType()` method |
| `voxel-search-form.beautified.js` | 1972 | `$nextTick(this.handleNavbars)` |

### FSE Child Theme
| File | Lines | Content |
|------|-------|---------|
| `navbar/edit.tsx` | 107-173 | Editor block discovery (useSelect) |
| `navbar/save.tsx` | 67-88 | vxConfig serialization (missing searchFormId) |
| `navbar/frontend.tsx` | 419-428 | NavbarWrapper (missing linkedPostTypes) |
| `navbar/shared/NavbarComponent.tsx` | 547-611 | search_form render + event dispatch |
| `navbar/types/index.ts` | 167-168 | NavbarVxConfig type (has searchFormId) |
| `navbar/inspector/ContentTab.tsx` | 274-276 | BlockRelationControl for search form |
| `Block_Loader.php` | 6040-6067 | inject_navbar_config (skips search_form) |
| `search-form/shared/SearchFormComponent.tsx` | 263-285 | Event listeners (no post-type switch) |
| `search-form/hooks/useSearchForm.ts` | 204-225 | setCurrentPostType implementation |
