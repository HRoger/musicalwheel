# Voxel Interaction Layer Strategy: From FSE Shim to Headless Hooks

**Last Updated:** January 2026
**Status:** Active Implementation

## Executive Summary
This document explains the strategic architectural decisions regarding Voxel's `commons.js` interactivity engine. It addresses why we use a Compatibility Shim for the Phase 1 FSE Child Theme and why we must abandon this approach for the future Headless Next.js implementation.

**Key Files:**
- `themes/voxel-fse/app/blocks/shared/voxel-commons.ts` - React-compatible commons (TypeScript)
- `themes/voxel-fse/assets/js/voxel-fse-compat.js` - Vue mixin & Google Maps patches (JavaScript)

---

## 1. Phase 1: The FSE Strategy (The "Body Transplant")
In the current Full Site Editing (FSE) child theme, we made a specific architectural trade-off: **Convert the Interface, Keep the Engine.**

### The Approach
-   **The Body (New):** We converted Voxel's PHP Widgets into native **React Blocks**.
    -   *Why?* Loading Voxel's Elementor PHP widgets inside Gutenberg would require loading the massive Elementor engine on every edit, causing extreme bloat and slowness. React blocks are lightweight and native to the editor.
-   **The Brain (Old):** We kept Voxel's original `commons.js`.
    -   *Why?* `commons.js` handles thousands of lines of complex logic (popups, AJAX filtering, map markers, authentication). Rewriting this in React now would mean forking the theme entirely and losing all future Voxel updates.
-   **The Connection (The Shim):** We created `voxel-fse-compat.js`.
    -   *Function:* This script acts as a nerve adapter. It tricks the old `commons.js` (which looks for Elementor DOM nodes) into talking to our new React Blocks (which use FSE DOM nodes).

### Why "Shim" instead of "Rewrite"?
1.  **Avoids the "Hard Fork" Trap:** If we rewrote `commons.js` in React now, we would effectively detach from Voxel's development path. Every security patch or feature update by Voxel would require manual porting.
2.  **Vue.js Dependency:** Voxel is fundamentally a Vue.js application on the frontend. The server renders HTML designed to be "hydrated" by Vue. Rewriting the engine in React means rewriting the server-side rendering templates too.

### Current Shim Capabilities
The `voxel-fse-compat.js` shim currently handles:

| Issue | Solution |
|-------|----------|
| Elementor DOM dependency | Patches `Voxel.mixins.base.mounted()` to handle FSE DOM structure |
| Google Maps billing errors | Intercepts `google.maps.importLibrary` and provides mock Places library |
| Widget/Post ID extraction | Graceful fallback from Elementor → FSE block → generated ID |

**Reference:** `themes/voxel-fse/assets/js/voxel-fse-compat.js`

---

## 1.5 The Two-File Architecture (Deep Dive)

Our FSE compatibility requires **TWO complementary files** that work together but serve different purposes:

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        BROWSER RUNTIME                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     window.Voxel                                 │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │    │
│  │  │ Voxel Parent    │  │ voxel-commons.ts│  │ voxel-fse-compat│  │    │
│  │  │ (commons.js)    │  │ (MERGES with)   │  │ (PATCHES Vue)   │  │    │
│  │  │                 │  │                 │  │                 │  │    │
│  │  │ • Vue mixins    │  │ • helpers       │  │ • mixins.base   │  │    │
│  │  │ • Maps.Map      │  │ • dialog()      │  │   mounted()     │  │    │
│  │  │ • Maps.Marker   │  │ • alert()       │  │                 │  │    │
│  │  │ • Maps.Clusterer│  │ • filters       │  │ • Google Maps   │  │    │
│  │  │ • Maps.Popup    │  │ • URL params    │  │   importLibrary │  │    │
│  │  │ • GoogleMaps()  │  │ • Maps.await()  │  │   patches       │  │    │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │    │
│  │           │                    │                    │           │    │
│  │           │    MERGE           │      PATCH         │           │    │
│  │           └──────────┬─────────┴────────────────────┘           │    │
│  │                      ▼                                          │    │
│  │            ┌─────────────────────┐                              │    │
│  │            │  UNIFIED window.Voxel│                              │    │
│  │            │  • All Vue mixins   │                              │    │
│  │            │  • All Maps classes │                              │    │
│  │            │  • All helpers      │                              │    │
│  │            │  • FSE-safe mounted │                              │    │
│  │            └─────────────────────┘                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐    │
│  │  Voxel Vue Components   │    │  FSE React Blocks               │    │
│  │  (popups, forms, etc.)  │    │  (map, search-form, etc.)       │    │
│  │                         │    │                                 │    │
│  │  Uses: Voxel.mixins     │    │  Uses: Voxel.Maps.await()       │    │
│  │        Voxel.Maps.Map   │    │        Voxel.helpers            │    │
│  └─────────────────────────┘    └─────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

### File Comparison

| Aspect | `voxel-commons.ts` | `voxel-fse-compat.js` |
|--------|--------------------|-----------------------|
| **Language** | TypeScript (compiled) | Vanilla JavaScript |
| **Target** | React/Gutenberg blocks | Voxel Vue components |
| **Load Timing** | With block frontend bundles | Inline in `<head>` (earliest) |
| **Primary Purpose** | Provide Voxel APIs to React | Patch Vue mixins for FSE DOM |
| **Strategy** | MERGE with `window.Voxel` | PATCH `Voxel.mixins.base` |
| **Google Maps** | Provides `Maps.await()` | Patches `importLibrary()` |

### voxel-commons.ts: React-Compatible Commons

**Location:** `themes/voxel-fse/app/blocks/shared/voxel-commons.ts`

**Purpose:** Provides Voxel's utility APIs (helpers, dialogs, filters) for React blocks.

**⚠️ CRITICAL: The MERGE Pattern**

The most important implementation detail is that `voxel-commons.ts` must **MERGE** with the existing `window.Voxel` object, not replace it:

```typescript
// ❌ BROKEN: Completely replaces window.Voxel
window.Voxel = {
    Maps: { await: safeAwait },
    helpers: { ... },
};
// RESULT: Voxel.Maps.Map, Voxel.Maps.Marker wiped out → Map block crashes

// ✅ CORRECT: Merges with existing window.Voxel
const existingVoxel = window.Voxel || {};
const existingMaps = existingVoxel.Maps || {};

const mergedMaps = {
    ...existingMaps,  // Preserve Map, Marker, Clusterer, GoogleMaps, etc.
    Loaded: existingMaps.Loaded || false,
    await: safeAwait,  // Add/override our safe await
};

window.Voxel = {
    ...existingVoxel,  // Preserve mixins, components, etc.
    _fseInitialized: true,
    Maps: mergedMaps,
    helpers: { ... },
};
```

**Why This Matters:**
- `vx:google-maps.js` adds `Voxel.Maps.Map`, `Voxel.Maps.Marker`, `Voxel.Maps.Clusterer`, etc.
- If we replace instead of merge, these classes are wiped out
- The Map block waits forever for `Voxel.Maps.Map` that no longer exists

**APIs Provided:**

| API | Purpose | Original Reference |
|-----|---------|-------------------|
| `Voxel.Maps.await(cb)` | Wait for maps, execute callback | commons.js:232-250 |
| `Voxel.helpers.debounce()` | Debounce function calls | commons.js:386-401 |
| `Voxel.helpers.currencyFormat()` | Format currency | commons.js:354-368 |
| `Voxel.helpers.dateFormat()` | Format dates | commons.js:325-327 |
| `Voxel.helpers.randomId()` | Generate random IDs | commons.js:463-474 |
| `Voxel.dialog()` | Show notification dialogs | commons.js:509-571 |
| `Voxel.alert()` | Show auto-dismiss alerts | commons.js:585-587 |
| `Voxel.addFilter()` | Register WP-style filter | commons.js:183-188 |
| `Voxel.applyFilters()` | Apply registered filters | commons.js:200-213 |
| `Voxel.getSearchParam()` | Get URL query param | commons.js:681-683 |
| `Voxel.setSearchParam()` | Set URL query param | commons.js:700-704 |

### voxel-fse-compat.js: Vue Mixin & Google Maps Patches

**Location:** `themes/voxel-fse/assets/js/voxel-fse-compat.js`

**Purpose:** Patches Voxel's Vue.js runtime to work with FSE DOM (no Elementor).

**Patch 1: Vue Mixin Base**

Voxel's `Voxel.mixins.base.mounted()` crashes in FSE:
```javascript
// Original (crashes in FSE - no .elementor-element exists)
this.widget_id = this.$el.parentElement.closest('.elementor-element').dataset.id;
```

The patch provides safe fallbacks:
```javascript
window.Voxel.mixins.base = {
    ...originalMixin,
    _fsePatched: true,
    mounted() {
        const elementorElement = this.$el?.parentElement?.closest?.('.elementor-element');
        if (elementorElement) {
            // Elementor context
            this.widget_id = elementorElement.dataset.id;
        } else {
            // FSE context - safe fallback
            this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
        }
    }
};
```

**Patch 2: Google Maps importLibrary**

When billing isn't enabled, `importLibrary('places')` crashes the page:
```javascript
google.maps.importLibrary = function(name) {
    return originalImportLibrary.apply(this, arguments).catch((err) => {
        if (name === 'places') {
            return { Autocomplete: class MockAutocomplete { ... } };
        }
        throw err;
    });
};
```

**Patch 3: CircleOverlay Stub**

Race condition protection:
```javascript
if (!window.Voxel.Maps.CircleOverlay) {
    window.Voxel.Maps.CircleOverlay = class StubCircleOverlay { ... };
}
```

### Why Two Files? Why Not Combine?

1. **Different Targets:** TypeScript for React vs vanilla JS for Vue runtime
2. **Different Timing:** Compat must load BEFORE Vue mounts; commons loads WITH blocks
3. **Different Bundling:** Compat is inline IIFE; commons is ES module in Vite bundle
4. **Separation of Concerns:** One provides APIs, one patches runtime

### Load Order

```
1. WordPress <head>
   └─► voxel-fse-compat.js (inline) ← Patches ready

2. Voxel Parent Scripts
   └─► commons.js ← Patches applied immediately
   └─► vx:google-maps.js ← Adds Maps.Map, Marker, etc.

3. FSE Block Frontend Scripts
   └─► map/frontend.js
       └─► voxel-commons.ts ← MERGES (doesn't replace!)
       └─► Map renders using Voxel.Maps.Map

4. Google Maps API Callback
   └─► Voxel.Maps.GoogleMaps() called
   └─► maps:loaded event
```

---

## 2. Phase 2: Transition Period (Building the Bridge)

Before jumping to full headless, Phase 2 focuses on **laying the groundwork** while maintaining Phase 1 stability.

### Key Activities
1.  **REST API Endpoints:** Build and test the APIs that will power headless.
    -   Already implemented: `voxel-fse/v1/create-post/fields-config`
    -   Already implemented: `voxel-fse/v1/map/post-location`
    -   Planned: `voxel-fse/v1/maps/config` (Google Maps configuration endpoint)

2.  **Headless-Ready Components:** Design React components that work in both environments.
    -   Example: `AddressAutocomplete.tsx` uses `window.Voxel.Maps.await()` pattern - works identically in WordPress or Next.js
    -   Example: Map block already has Next.js-ready architecture documented in `google-maps-complete-implementation-summary.md`

3.  **Parallel Hook Development:** Start building React hooks alongside the shim.
    ```typescript
    // Can be developed and tested now, used in Phase 3
    export function useVoxelMaps() { ... }
    export function useVoxelSearch() { ... }
    export function useVoxelAuth() { ... }
    ```

4.  **API Contract Documentation:** Document the exact REST/GraphQL endpoints Voxel exposes.

### Phase 2 Deliverables
- [ ] Complete REST API endpoint inventory
- [ ] Maps configuration endpoint (`/maps/config`)
- [ ] Authentication endpoints documented
- [ ] Core React hooks prototyped
- [ ] Next.js proof-of-concept with one working block

---

## 3. Phase 3: The Headless Strategy (The "Brain Transplant")
When we move to the Headless Next.js architecture, the "Shim" strategy becomes invalid. We cannot keep the old engine.

### Why the Shim Fails in Headless
1.  **No WordPress Frontend:** In a headless setup, the browser interacts with a Next.js server, not WordPress. `commons.js` is designed to run in a WordPress environment, searching the DOM for specific classes and expecting standard WordPress AJAX endpoints.
2.  **Architecture Mismatch:** `commons.js` follows an imperative pattern (Direct DOM Manipulation: "Find ID, update HTML"). Headless React follows a declarative pattern ("State changed, UI updates").
3.  **The "Electric Car" Analogy:**
    -   *Phase 1 (Shim):* We put a modern body on an existing gas engine. An adapter (shim) makes them fit.
    -   *Phase 3 (Headless):* We are building an electric car (Next.js). We cannot put the old gas engine (`commons.js`) inside it. It doesn't fit, and it defeats the purpose.

### The New Approach: Custom "Hooks"
Instead of a monolithic `commons.js`, the headless Phase will involve writing a **Custom React Interaction Layer**:
-   **Hooks over Scripts:** Instead of a 5000-line script file, we use composable React Hooks.
    -   Old Way: `Voxel.search(term_id)` (Global Function)
    -   Headless Way: `useVoxelSearch()` (React Hook)
-   **API Driven:** The interactions will speak directly to the Voxel REST/GraphQL API, bypassing WordPress DOM dependency entirely.

### Planned React Hooks

| Hook | Replaces | API Endpoint |
|------|----------|--------------|
| `useVoxelMaps()` | `Voxel.Maps.*` | `/voxel-fse/v1/maps/config` |
| `useVoxelSearch()` | `Voxel.search()` | `/voxel/v1/search` |
| `useVoxelAuth()` | `Voxel.auth.*` | `/voxel/v1/auth/*` |
| `useVoxelNotifications()` | `Voxel.alert()`, `Voxel.dialog()` | N/A (client-side only) |
| `useVoxelFileUpload()` | `window._vx_file_upload_cache` | `/voxel/v1/upload` |
| `useVoxelCreatePost()` | Create Post form logic | `/voxel/v1/create-post` |

---

## 3.5 File Evolution: What Happens to Each File

### voxel-fse-compat.js → ❌ DEPRECATED (Deleted)

This file will be **completely removed** in the headless phase because:

1. **No Vue.js** - Next.js uses React exclusively. There are no Voxel Vue components to patch.
2. **No Elementor DOM** - The whole point of the patch was to handle missing `.elementor-element`. In headless, there's no WordPress DOM at all.
3. **No Google Maps shim needed** - We'll use `@react-google-maps/api` directly with proper error handling built-in.

```
Phase 1 (FSE):     voxel-fse-compat.js patches Vue mixins ✅ ACTIVE
Phase 2 (Transition): voxel-fse-compat.js maintained for backwards compat ✅ ACTIVE
Phase 3 (Headless): DELETE - No Vue components exist ❌ REMOVED
```

**Key insight:** `voxel-fse-compat.js` is a **temporary bridge** that dies with Vue.

### voxel-commons.ts → 🔄 EVOLVES into `@musicalwheel/voxel-sdk`

This file will be **transformed** into a proper SDK package:

```
Phase 1 (FSE):     voxel-commons.ts (merged into window.Voxel) ✅ ACTIVE
Phase 2 (Transition): voxel-commons.ts + new hooks in parallel ✅ ACTIVE
Phase 3 (Headless): @musicalwheel/voxel-sdk (standalone React package) 🔄 EVOLVED
```

#### What Gets KEPT (Extracted to SDK)

| Current API | Headless Equivalent | Notes |
|-------------|---------------------|-------|
| `Voxel.helpers.debounce()` | `import { debounce } from '@musicalwheel/voxel-sdk'` | Pure utility, no changes |
| `Voxel.helpers.currencyFormat()` | `import { currencyFormat } from '@musicalwheel/voxel-sdk'` | Pure utility |
| `Voxel.helpers.dateFormat()` | `import { dateFormat } from '@musicalwheel/voxel-sdk'` | Pure utility |
| `Voxel.helpers.randomId()` | `import { randomId } from '@musicalwheel/voxel-sdk'` | Pure utility |
| `Voxel.alert()` / `Voxel.dialog()` | `import { useNotifications } from '@musicalwheel/voxel-sdk'` | Becomes React hook + context |
| `Voxel.addFilter()` / `applyFilters()` | `import { useFilters } from '@musicalwheel/voxel-sdk'` | Becomes React hook |
| `Voxel.getSearchParam()` | `import { useSearchParams } from 'next/navigation'` | Use Next.js native |

#### What Gets REMOVED

| Current API | Why Removed |
|-------------|-------------|
| `Voxel.Maps.await()` | Use `@react-google-maps/api` with `useJsApiLoader()` instead |
| `Voxel.mixins` | Vue-specific, not needed in React |
| `Voxel.components` | Vue-specific, not needed in React |
| `window.Voxel` global | No globals in Next.js - use imports |

#### What Gets REPLACED with Hooks

```typescript
// Current (FSE - voxel-commons.ts)
Voxel.Maps.await(() => {
    const map = new Voxel.Maps.Map(container, config);
});

// Headless (Next.js - @react-google-maps/api)
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

function MapComponent() {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: '...' });
    if (!isLoaded) return <Skeleton />;
    return <GoogleMap center={center} zoom={12} />;
}
```

### Architecture Evolution Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: FSE CHILD THEME                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │ voxel-fse-      │    │ voxel-commons   │    │ Voxel Parent    │    │
│  │ compat.js       │    │ .ts             │    │ commons.js      │    │
│  │                 │    │                 │    │                 │    │
│  │ Patches Vue     │    │ Provides APIs   │    │ Vue runtime     │    │
│  │ mixins          │    │ to React        │    │                 │    │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘    │
│           │                      │                      │             │
│           └──────────────────────┴──────────────────────┘             │
│                                  │                                     │
│                                  ▼                                     │
│                        window.Voxel (unified)                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                                  │
                                  │ MIGRATION
                                  ▼

┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: HEADLESS NEXT.JS                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │ ❌ DELETED      │    │ @musicalwheel/  │    │ @react-google-  │    │
│  │                 │    │ voxel-sdk       │    │ maps/api        │    │
│  │ (no Vue)        │    │                 │    │                 │    │
│  │                 │    │ • useFilters()  │    │ • GoogleMap     │    │
│  │                 │    │ • useNotify()   │    │ • Marker        │    │
│  │                 │    │ • helpers       │    │ • useJsApiLoader│    │
│  └─────────────────┘    └────────┬────────┘    └────────┬────────┘    │
│                                  │                      │             │
│                                  └──────────┬───────────┘             │
│                                             │                          │
│                                             ▼                          │
│                              React Components (no globals)             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Planned SDK Package Structure

```
packages/voxel-sdk/
├── package.json
├── src/
│   ├── index.ts              # Main exports
│   ├── hooks/
│   │   ├── useNotifications.ts   # Replaces Voxel.alert/dialog
│   │   ├── useFilters.ts         # Replaces Voxel.addFilter/applyFilters
│   │   ├── useVoxelAuth.ts       # Authentication state
│   │   └── useVoxelSearch.ts     # Search/filter state
│   ├── utils/
│   │   ├── currency.ts           # currencyFormat
│   │   ├── date.ts               # dateFormat, dateFormatYmd
│   │   ├── debounce.ts           # debounce
│   │   └── id.ts                 # randomId, sequentialId
│   └── api/
│       ├── client.ts             # REST/GraphQL client
│       └── endpoints.ts          # Typed API endpoints
└── dist/                     # Compiled output
```

### Summary Table

| File | Phase 1 (FSE) | Phase 2 (Transition) | Phase 3 (Headless) |
|------|---------------|----------------------|-------------------|
| `voxel-fse-compat.js` | ✅ Active | ✅ Maintained | ❌ **Deleted** |
| `voxel-commons.ts` | ✅ Active | ✅ Active + hooks | 🔄 **Evolves** → SDK |
| `window.Voxel` global | ✅ Used | ✅ Used | ❌ No globals |
| Maps integration | `Voxel.Maps.await()` | Both patterns | `@react-google-maps/api` |
| Notifications | `Voxel.alert()` | Both patterns | `useNotifications()` hook |

**Key insight:** `voxel-fse-compat.js` is a **temporary bridge** that dies with Vue, while `voxel-commons.ts` contains **reusable logic** that gets extracted and modernized into a proper SDK.

---

## 4. Comparison Summary

| Feature | Phase 1 (FSE Child Theme) | Phase 2 (Transition) | Phase 3 (Headless Next.js) |
| :--- | :--- | :--- | :--- |
| **UI Components** | React Blocks (Server Rendered) | React Blocks + Hooks | React Components (Next.js) |
| **Interactivity Engine** | Voxel `commons.js` (Vue) | Shim + New Hooks | Custom React Hooks |
| **Compatibility Layer** | **Shim** (`voxel-fse-compat.js`) | Shim (maintained) | None (Native Implementation) |
| **Logic Source** | Uses Voxel Parent Theme files | Parent + REST APIs | Uses Voxel API directly |
| **Maintenance** | **Low:** Auto updates from Parent | **Medium:** Testing both paths | **High:** We verify API compatibility |
| **Performance** | Good (Standard WordPress) | Good | Excellent (Single Page App) |
| **Risk Level** | Low (Production ready) | Medium (Parallel development) | Higher (Full rewrite) |

---

## 5. Migration Path

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: FSE CHILD THEME (Current)                            │
│  • React Blocks render UI                                       │
│  • commons.js handles interactivity                             │
│  • voxel-fse-compat.js bridges the gap                         │
│  • Full Voxel update compatibility                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: TRANSITION (Building Infrastructure)                  │
│  • REST API endpoints built and tested                          │
│  • React hooks developed (useVoxelMaps, useVoxelSearch, etc.)  │
│  • Hooks work alongside shim (no breaking changes)              │
│  • Next.js proof-of-concept validates approach                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: HEADLESS NEXT.JS                                      │
│  • Next.js frontend on Vercel                                   │
│  • WordPress as headless CMS only                               │
│  • Custom React hooks replace commons.js                        │
│  • Direct API communication (no DOM dependency)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Files Reference

| File | Phase | Purpose | Headless Fate |
|------|-------|---------|---------------|
| `assets/js/voxel-fse-compat.js` | 1-2 | Compatibility shim: Vue mixin patches, Google Maps patches | ❌ **Deleted** (no Vue) |
| `assets/js/voxel-fse-compat-README.md` | 1-2 | Shim documentation | ❌ **Deleted** |
| `app/blocks/shared/voxel-commons.ts` | 1-2 | React-compatible Voxel API (MERGES with window.Voxel) | 🔄 **Evolves** → `@musicalwheel/voxel-sdk` |
| `app/blocks/src/map/voxel-maps-adapter.ts` | 1-2 | TypeScript wrapper for Voxel.Maps | 🔄 **Replaced** → `@react-google-maps/api` |
| `app/controllers/fse-compatibility-controller.php` | 1-2 | Enqueues voxel-fse-compat.js | ❌ **Deleted** |
| `app/blocks/Block_Loader.php` | 1-2 | Manages script loading, maps soft-loading bypass | ❌ **Deleted** (no WP frontend) |
| `docs/block-conversions/google-maps-complete-implementation-summary.md` | 1-3 | Maps implementation across all contexts | ✅ **Updated** for headless |
| `app/rest-api/` (planned) | 2-3 | REST API endpoints for headless | ✅ **Kept** (API layer) |
| `packages/voxel-sdk/` (planned) | 3 | React hooks & utilities SDK | ✅ **New** |
| `nextjs-frontend/` (planned) | 3 | Next.js frontend application | ✅ **New** |

---

## 7. Debugging Guide

### Map Not Loading (Timeout)

**Symptom:** Console shows `Voxel: false` repeatedly, then timeout.

**Check 1: Verify MERGE pattern**
```javascript
// In browser console
console.log(Voxel.Maps.Map);      // Should be a class, not undefined
console.log(Voxel.Maps.Marker);   // Should be a class
console.log(Voxel.Maps.Loaded);   // true after maps:loaded event
```

**Check 2: Look for initialization log**
```
[Voxel FSE Commons] Initialized (React-compatible)
```

**Root Cause:** If `Voxel.Maps.Map` is undefined, `voxel-commons.ts` is REPLACING instead of MERGING.

### Vue Component Crash (dataset error)

**Symptom:** `Cannot read properties of null (reading 'dataset')`

**Check:** Verify compat shim loaded:
```javascript
console.log(Voxel.mixins.base._fsePatched);  // Should be true
```

**Root Cause:** `voxel-fse-compat.js` didn't load before Vue mounted, or patch failed.

### Google Maps Places Error

**Symptom:** `BillingNotEnabledMapError` crashes page

**Check:** Look for mock fallback:
```
[Voxel FSE] Providing mock Places library to prevent crash
```

**Root Cause:** If no mock message, `importLibrary` patch didn't apply.

---

## Conclusion
The **Shim** is the correct bridge technology for Phase 1 because it maintains stability and upgradeability within the WordPress ecosystem. **Phase 2** builds the infrastructure (REST APIs, React hooks) needed for a smooth transition. The **Custom React Engine** is the requirement for Phase 3 because it decouples us from the WordPress DOM entirely.

The key insight is that we're not doing a "big bang" migration. Each phase builds on the previous one, with Phase 2 allowing us to develop and test headless patterns while the FSE child theme remains stable in production.

---

## Appendix: Critical Fix History

### January 2026: Map Block MERGE Fix

**Problem:** Map block showed "Timeout waiting for maps" with `Voxel: false` in console.

**Root Cause:** `voxel-commons.ts` was doing:
```typescript
window.Voxel = { Maps: { await: ... } };  // REPLACES everything
```
This wiped out `Voxel.Maps.Map`, `Voxel.Maps.Marker`, etc. defined by `vx:google-maps.js`.

**Solution:** Changed to MERGE pattern:
```typescript
const existingMaps = window.Voxel?.Maps || {};
window.Voxel = {
    ...window.Voxel,
    Maps: { ...existingMaps, await: safeAwait }
};
```

**Files Modified:**
- `app/blocks/shared/voxel-commons.ts` (lines 148-198)
