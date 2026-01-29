# WordPress Preview vs Headless Architecture

**Date:** January 2026
**Status:** Reference Documentation
**Related:** 01-accelerated-option-c-plus-strategy.md

---

## Overview

This document clarifies the architectural differences between WordPress Preview (transitional) and Headless (Next.js) implementations for voxel-fse blocks.

---

## WordPress Preview (Current - Transitional)

```
┌─────────────────────────────────────────────────────────────────┐
│  WordPress Editor                                               │
├─────────────────────────────────────────────────────────────────┤
│  edit.tsx          → Editor UI (configure block)                │
│  block.json        → Attribute schema (source of truth)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (on save)
┌─────────────────────────────────────────────────────────────────┐
│  save.tsx          → Generates:                                 │
│                       • HTML structure                          │
│                       • <script class="vxconfig"> JSON          │
│                       • data-* attributes (for headless)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (on frontend view)
┌─────────────────────────────────────────────────────────────────┐
│  render.php        → Server-side processing:                    │
│  (via Block_Loader)   • Visibility rules                        │
│                       • Loop element                            │
│                       • VoxelScript rendering                   │
│                       • Style injection                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  frontend.js       → Voxel-FSE React interactivity              │
│  (Compiled .tsx)      • Reads vxconfig from <script> tag        │
│                       • Mounts React components (createRoot)    │
│                       • Handles user interactions               │
│                       • NOT Vue.js - fully converted to React   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Headless (Future - Next.js)

```
┌─────────────────────────────────────────────────────────────────┐
│  WordPress (Headless CMS)                                       │
├─────────────────────────────────────────────────────────────────┤
│  edit.tsx          → Editor UI (same as preview)                │
│  block.json        → Attribute schema (source of truth)        │
│                                                                 │
│  ❌ render.php     → IGNORED (not used)                         │
│  ❌ save.tsx       → IGNORED (HTML not used, only attributes)   │
│  ❌ frontend.js    → IGNORED (Next.js has its own React impl)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (GraphQL query)
┌─────────────────────────────────────────────────────────────────┐
│  WPGraphQL + WPGraphQL Content Blocks                           │
├─────────────────────────────────────────────────────────────────┤
│  Exposes block.json attributes via GraphQL:                     │
│                                                                 │
│  query {                                                        │
│    post(id: "...") {                                            │
│      editorBlocks {                                             │
│        name              # "voxel-fse/search-form"              │
│        attributes {      # From block.json schema               │
│          postTypes                                              │
│          filterConfig                                           │
│          visibilityRules # For client-side evaluation           │
│          ...                                                    │
│        }                                                        │
│      }                                                          │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App                                                    │
├─────────────────────────────────────────────────────────────────┤
│  BlockRenderer.tsx → Maps block names to React components       │
│                                                                 │
│  switch (block.name) {                                          │
│    case 'voxel-fse/search-form':                                │
│      return <SearchFormBlock attributes={block.attributes} />;  │
│    case 'voxel-fse/post-feed':                                  │
│      return <PostFeedBlock attributes={block.attributes} />;    │
│    ...                                                          │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Individual React Block Components                              │
├─────────────────────────────────────────────────────────────────┤
│  SearchFormBlock.tsx   → Full React implementation              │
│  PostFeedBlock.tsx     → Full React implementation              │
│  MapBlock.tsx          → Full React implementation              │
│  ...                                                            │
│                                                                 │
│  Each component:                                                │
│  • Receives attributes as props (from GraphQL)                  │
│  • Uses TypeScript utilities (generateAdvancedStyles, etc.)     │
│  • Handles its own interactivity (React state, not Vue)         │
│  • Wrapped by BlockWrapper for visibility/loop                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Usage Summary

| Component | WordPress Preview | Headless (Next.js) |
|-----------|-------------------|---------------------|
| `block.json` | ✅ Used | ✅ Used (via GraphQL) |
| `edit.tsx` | ✅ Used | ✅ Same file |
| `save.tsx` | ✅ Generates vxconfig | ❌ Ignored |
| `render.php` | ✅ Visibility/Loop | ❌ Ignored |
| `frontend.js` | ✅ Voxel-FSE React | ❌ Ignored |
| React component | ❌ N/A | ✅ New implementation |

---

## Individual React Blocks for Headless

**YES, this is exactly the architecture:**

1. **WPGraphQL Content Blocks** returns an array of blocks with their attributes
2. **Next.js** iterates over blocks and renders the matching React component
3. **Each block** is a standalone React component that receives `attributes` as props

Example:
```tsx
// apps/frontend/components/blocks/SearchFormBlock.tsx
export function SearchFormBlock({ attributes }: { attributes: SearchFormAttributes }) {
    const { postTypes, filterConfig, visibilityRules } = attributes;

    // Use same TypeScript utilities from WordPress
    const styles = generateAdvancedStyles(attributes);

    // Full React implementation (no Vue, no vxconfig)
    return (
        <div style={styles}>
            {/* React-based search form UI */}
        </div>
    );
}
```

---

## Key Clarification: Voxel-FSE Uses React, NOT Vue.js

**Verified via Code Review:**
- `voxel/assets/dist/search-form.js` → Uses Vue.js (`Vue.createApp`, `data()`, `methods:`)
- `voxel-fse/app/blocks/src/*/frontend.tsx` → Uses React (`createRoot`, `useState`, `useEffect`)

The vxconfig JSON passes configuration to **React components** in voxel-fse, not Vue.js.
The original Voxel Vue.js frontend would NOT work in Next.js (this is why we converted to React).

---

## The Intentional Duplication

During the transitional period:
- **WordPress Preview:** `save.tsx` + `frontend.js` (Voxel-FSE **React**)
- **Headless:** Individual React components in Next.js

Once headless is live, you can optionally remove the preview shim (render.php, save.tsx, frontend.js) if you no longer need WordPress preview.

---

## Architecture Quick Reference

```
WordPress Preview (Now)          Headless (Future)
─────────────────────────        ─────────────────────────
edit.tsx (Editor UI)       →     edit.tsx (same)
block.json (Schema)        →     block.json (via GraphQL)
save.tsx (vxconfig)        →     ❌ ignored
render.php (Visibility)    →     ❌ ignored
frontend.js (React)        →     ❌ ignored (Next.js has own)
                                 ↓
                                 BlockRenderer.tsx
                                 ↓
                                 Individual React components
```

---

## Relationship: WordPress Preview vs Headless Implementation

```
WordPress Preview (voxel-fse)              Headless (Next.js)
────────────────────────────────           ────────────────────────────────
voxel-fse/app/blocks/src/                  apps/frontend/components/blocks/
  search-form/                               SearchFormBlock.tsx
    frontend.tsx
```

**The implementations are EQUIVALENT - only the DATA SOURCE differs:**

| Aspect | WordPress Preview (`frontend.tsx`) | Headless (`SearchFormBlock.tsx`) |
|--------|-----------------------------------|----------------------------------|
| **Data Source** | Reads from `<script class="vxconfig">` JSON | Receives `attributes` via GraphQL props |
| **Mounting** | `createRoot` on DOM element | Next.js renders directly |
| **Config Access** | `JSON.parse(vxconfigScript.textContent)` | `props.attributes` |
| **Same React Logic** | ✅ | ✅ (can share components) |

### Code Comparison

```tsx
// WordPress Preview: voxel-fse/app/blocks/src/search-form/frontend.tsx
const vxconfig = JSON.parse(document.querySelector('.vxconfig').textContent);
createRoot(container).render(<SearchFormComponent config={vxconfig} />);

// Headless: apps/frontend/components/blocks/SearchFormBlock.tsx
export function SearchFormBlock({ attributes }) {
    return <SearchFormComponent config={attributes} />;
}
```

### Shared Component Strategy

The **core component logic** (e.g., `SearchFormComponent`) can be:
1. **Duplicated** - Separate implementations (current approach during transition)
2. **Shared** - Extract to a shared package that both WordPress and Next.js consume

The difference is only HOW the config data reaches the component:
- **WordPress Preview:** vxconfig JSON embedded in HTML by save.tsx
- **Headless:** GraphQL query returns block.json attributes as props
