# Quick Search Block - Phase 3 Parity

**Date:** December 23, 2025 (Updated: Dec 23, 2025 - verified 100%)
**Status:** Complete (100% parity)
**Reference:** voxel-quick-search.beautified.js (588 lines, ~3KB)

## Summary

The quick-search block has **complete parity** with Voxel's Vue implementation. All features are implemented: keyboard shortcuts (Ctrl+K / Cmd+K, Escape), tabbed/single display modes, localStorage recent searches (max 8 items), 250ms debounce, and proper ?vx=1 AJAX integration. The React implementation uses React portal instead of Vue teleport for popup rendering, which is an architectural difference that produces identical user experience.

**Note:** Arrow key navigation through results was previously identified as a gap, but analysis of the Voxel source code (voxel-quick-search.beautified.js lines 218-229) confirms that Voxel only implements Ctrl+K toggle and Escape close - no arrow navigation exists in the original.

## Voxel JS Analysis

- **Total lines:** 588
- **Framework:** Vue.js 3 (Vue.createApp)
- **Mixins:** Voxel.mixins.base
- **Components:** form-group (Voxel.components.formGroup)
- **API:** ?vx=1&action=quick_search
- **Debounce:** 250ms (Voxel.helpers.debounce)
- **localStorage key:** voxel:recent_searches

### Core Features

| Feature | Implementation |
|---------|---------------|
| Keyboard toggle | Ctrl+K / Cmd+K (keyCode 75) |
| Keyboard close | Escape (keyCode 27) |
| Display modes | tabbed (active post type) / single (all post types) |
| Recent searches | Max 8 items in localStorage |
| Min length | 2 characters (config.keywords.minlength) |
| Debounce | 250ms before API call |

## React Implementation Analysis

- **Entry point:** frontend.tsx (~352 lines)
- **Main component:** QuickSearchComponent.tsx (~766 lines)
- **Types:** types.ts
- **Architecture:** Props-based React with hooks

### Key Implementation Details

1. **Keyboard Shortcuts** - document.addEventListener for Ctrl+K, Escape
2. **Debounce** - Custom debounce utility matching 250ms timing
3. **AJAX** - Uses ?vx=1&action=quick_search (NOT admin-ajax.php)
4. **Portal** - React portal for popup overlay (Vue teleport equivalent)
5. **localStorage** - Same key (voxel:recent_searches), same 8-item limit

## Parity Checklist

### Event Handlers

| Voxel Event | React Implementation | Status |
|-------------|---------------------|--------|
| Ctrl+K / Cmd+K toggle | useEffect + keydown listener (keyCode 75) | ✅ Done |
| Escape close | useEffect + keydown listener (keyCode 27) | ✅ Done |
| Input change | onChange + debouncedSearch | ✅ Done |
| Tab click | onClick + setActivePostType | ✅ Done |
| Result click | onClick + saveSearchItem | ✅ Done |
| Recent click | onClick + handleRecentClick | ✅ Done |
| Clear searches | onClick + clearRecents | ✅ Done |
| Form submit | onSubmit + viewArchive | ✅ Done |

### State Management

| Vue data() Property | React useState | Status |
|---------------------|----------------|--------|
| config | vxConfig (prop) | ✅ Done |
| postTypes | postTypes (prop) | ✅ Done |
| activePopup | isPopupOpen | ✅ Done |
| activeType | activePostType | ✅ Done |
| search | search | ✅ Done |
| loading | isLoading | ✅ Done |
| recent | recentSearches | ✅ Done |
| results | results | ✅ Done |

### API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| ?vx=1&action=quick_search | fetch() | ✅ Done |
| Query params: search, post_types | URLSearchParams | ✅ Done |
| Response handling | data.success check | ✅ Done |
| Error handling | try/catch | ✅ Done |

### CSS Classes

| Voxel Class | React Usage | Status |
|-------------|-------------|--------|
| .quick-search | Container class | ✅ Done |
| .quick-search-keyword | Form group class | ✅ Done |
| .ts-filter | Button class | ✅ Done |
| .ts-popup-target | Button class | ✅ Done |
| .ts-quicksearch-popup | Popup container | ✅ Done |
| .ts-popup-overlay | Portal wrapper | ✅ Done |
| .ts-popup-backdrop | Click backdrop | ✅ Done |
| .ts-sticky-top | Search input header | ✅ Done |
| .ts-input-icon | Input with icon | ✅ Done |
| .ts-generic-tabs | Post type tabs | ✅ Done |
| .ts-tab-active | Active tab | ✅ Done |
| .ts-term-dropdown | Results dropdown | ✅ Done |
| .ts-term-dropdown-list | Results list | ✅ Done |
| .ts-empty-user-tab | Empty state | ✅ Done |
| .vx-pending | Loading state | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | data-hydrated check | ✅ Done |
| Search term too short | Clears results, no API call | ✅ Done |
| Duplicate queries | Check same query skipped | ✅ Done |
| Invalid localStorage | try/catch, return empty array | ✅ Done |
| Network errors | try/catch, clear results | ✅ Done |
| Dynamic content (AJAX) | voxel:markup-update listener | ✅ Done |
| Turbo/PJAX | turbo:load, pjax:complete listeners | ✅ Done |

## localStorage Format

Both implementations use identical format:

```javascript
// Key: "voxel:recent_searches"
// Value: JSON array, max 8 items
[
  {
    "key": "post:123" | "keywords:term",
    "type": "post" | "keywords",
    "title": "Search Term or Post Title",
    "logo": "<img ...>" | null,
    "icon": "<i ...>" | null,
    "link": "https://..."
  }
]
```

## API Request/Response Format

### Request
```
GET /?vx=1&action=quick_search
  &search=term
  &post_types={"places":{"filter_key":"keywords","taxonomies":["category"]}}
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "key": "post:123",
      "type": "post",
      "title": "Result Title",
      "logo": "<img ...>",
      "link": "https://..."
    }
  ]
}
```

## FSE-Specific Enhancements

### 1. Config Normalization for Next.js

```typescript
function normalizeConfig(raw: any): VxConfig {
  // Handles both camelCase (REST) and snake_case (vxconfig)
  return {
    displayMode: raw.displayMode ?? raw.display_mode ?? 'single',
    singleMode: {
      submitTo: raw.singleMode?.submitTo ?? raw.single_mode?.submit_to ?? null,
      // ...
    }
  };
}
```

### 2. REST API for Post Types

```typescript
async function fetchPostTypes(postTypeKeys: string[]): Promise<PostTypeConfig[]> {
  const endpoint = `${restUrl}voxel-fse/v1/quick-search/post-types`;
  // Enables headless/Next.js configuration
}
```

### 3. Portal-Based Popup

```typescript
// Frontend: Uses React portal (matches Vue teleport behavior)
return createPortal(
  <div className="ts-popup-overlay">
    <div className="ts-popup-backdrop" onClick={() => setIsPopupOpen(false)} />
    {popupContent}
  </div>,
  document.body
);
```

### 4. vxconfig Script for DevTools

```typescript
// Re-renders vxconfig in React output for DevTools visibility
<script type="text/json" className="vxconfig">
  {JSON.stringify(configData)}
</script>
```

## Architectural Differences (Intentional)

| Aspect | Voxel Vue | React FSE | Reason |
|--------|-----------|-----------|--------|
| Framework | Vue 3 createApp | React hooks | Gutenberg compatibility |
| Popup | Vue teleport | React portal | Framework equivalent |
| Debounce | Voxel.helpers.debounce | Custom debounce | No external dependency |
| Event binding | document.onkeydown | addEventListener | Better cleanup |
| Config | In-component parse | Props-based | Next.js readiness |

## Code Quality

- ✅ TypeScript strict mode
- ✅ useCallback for memoized handlers
- ✅ useEffect with proper cleanup
- ✅ useMemo for debounced function
- ✅ Props-based component (no global dependencies)
- ✅ vxconfig output for DevTools visibility
- ✅ Comments with file path references

## Build Output

Build verified December 23, 2025:
```
frontend.js  24.69 kB | gzip: 7.66 kB
```

## Conclusion

The quick-search block has **100% parity** with Voxel's Vue implementation:

- ✅ Keyboard shortcuts (Ctrl+K / Cmd+K, Escape)
- ✅ Display modes (tabbed vs single)
- ✅ localStorage recent searches (same key, max 8 items)
- ✅ Debounce timing (250ms)
- ✅ Min keyword length (2 characters)
- ✅ AJAX via ?vx=1&action=quick_search
- ✅ CSS classes match exactly
- ✅ Result structure (logo → icon → default)
- ✅ "Search for" link at bottom
- ✅ Clear searches functionality
- ✅ Re-initialization prevention
- ✅ Turbo/PJAX support
- ✨ Extra: REST API for post types (Next.js ready)
- ✨ Extra: Config normalization (camelCase/snake_case)

The architectural differences (Vue → React) produce identical user experience. All features from Voxel's quick-search are implemented.
