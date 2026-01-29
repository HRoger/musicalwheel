# Accelerated Option C+ Strategy

**Date:** December 2025
**Goal:** Convert ALL blocks to Option C+ in parallel, skip Option A entirely
**Blocks:** 3 existing FSE + 31 Voxel widgets = 34 total

---

## The Accelerated Plan

### ❌ OLD Plan (Phase 3 with Option A)

```
Phase 1-2: Build 3 blocks with Option A
  ├─ render.php (WordPress)
  ├─ frontend.tsx (Next.js)
  └─ Duplicated logic

Phase 3: Build 31 blocks with Option A
  ├─ render.php (WordPress)
  ├─ frontend.tsx (Next.js)
  └─ Duplicated logic

Total: 34 blocks × 2 implementations = 68 implementations
Timeline: 24-30 weeks
Technical Debt: HIGH
```

### ✅ NEW Plan (All Option C+)

```
Phase 1: Convert 3 existing FSE blocks to Option C+
  ├─ Remove render.php
  ├─ Add save() function
  ├─ Connect to Voxel REST API
  └─ Single implementation

Phase 2: Convert 31 Voxel widgets to Option C+ FSE
  ├─ Use proven pattern from Phase 1
  ├─ Build once (React save + API)
  └─ Single implementation

Total: 34 blocks × 1 implementation = 34 implementations
Timeline: 12-16 weeks
Technical Debt: NONE
```

**Time Savings: 50% faster (8-14 weeks saved)**

---

## Corrected Project Structure

### Directory Layout

```
musicalwheel/
│
├── wp-content/
│   └── themes/
│       ├── voxel/                     # Parent theme (don't modify)
│       │
│       └── voxel-fse/                # ⭐ Child theme (all your code)
│           ├── functions.php
│           ├── style.css
│           │
│           ├── app/
│           │   ├── blocks/
│           │   │   ├── Block_Loader.php
│           │   │   │
│           │   │   └── src/          # ⭐ All blocks here
│           │   │       ├── shared/   # Shared components
│           │   │       │   ├── SearchFormComponent.tsx
│           │   │       │   ├── CreatePostComponent.tsx
│           │   │       │   └── PopupKitComponent.tsx
│           │   │       │
│           │   │       ├── search-form/
│           │   │       │   ├── block.json
│           │   │       │   ├── index.tsx
│           │   │       │   ├── edit.tsx
│           │   │       │   ├── save.tsx        # Option C+ save
│           │   │       │   ├── hooks/
│           │   │       │   │   └── useVoxelFilters.ts
│           │   │       │   └── style.scss
│           │   │       │
│           │   │       ├── create-post/
│           │   │       │   ├── block.json
│           │   │       │   ├── index.tsx
│           │   │       │   ├── edit.tsx
│           │   │       │   ├── save.tsx        # Option C+ save
│           │   │       │   └── hooks/
│           │   │       │       └── useVoxelFields.ts
│           │   │       │
│           │   │       ├── popup-kit/
│           │   │       │   ├── block.json
│           │   │       │   ├── index.tsx
│           │   │       │   ├── edit.tsx
│           │   │       │   ├── save.tsx        # Option C+ save
│           │   │       │   └── style.scss
│           │   │       │
│           │   │       └── ... (31 more blocks)
│           │   │
│           │   ├── controllers/
│           │   │   ├── voxel-api-controller.php    # REST API
│           │   │   ├── supabase-sync-controller.php
│           │   │   └── fse-base-controller.php
│           │   │
│           │   └── utils/
│           │       └── api-helpers.php
│           │
│           ├── assets/                # Compiled assets
│           │   └── blocks/
│           │       ├── search-form/
│           │       │   ├── index.js
│           │       │   └── style.css
│           │       └── ...
│           │
│           └── vite.blocks.config.js  # Build configuration
│
├── apps/
│   └── musicalwheel-frontend/        # ⭐ Next.js frontend
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── [slug]/
│       │   │   └── page.tsx
│       │   └── events/
│       │       └── page.tsx
│       │
│       ├── components/
│       │   └── blocks/                # Block renderers
│       │       ├── SearchFormBlock.tsx
│       │       ├── CreatePostBlock.tsx
│       │       ├── PopupKitBlock.tsx
│       │       └── index.tsx          # Block registry
│       │
│       ├── lib/
│       │   ├── wordpress.ts           # WPGraphQL client
│       │   ├── voxel-api.ts           # Voxel REST API client
│       │   └── supabase.ts            # Supabase client
│       │
│       └── package.json
│
└── docs/
    └── conversions/
        ├── headless-architecture-options-summary.md
        ├── voxel-fse-future-strategy.md
        └── accelerated-option-c-plus-strategy.md
```

**Key Points:**

- ✅ All blocks in child theme, NOT plugin
- ✅ Shared components in `src/shared/`
- ✅ Single build system (Vite)
- ✅ Next.js in separate directory

---

## Phase 1: Convert 3 Existing FSE Blocks (Week 1-2)

### Current State of 3 Blocks

**Block Status Check:**

```bash
# Check what exists
ls themes/voxel-fse/app/blocks/src/popup-kit/
ls themes/voxel-fse/app/blocks/src/create-post/
ls themes/voxel-fse/app/blocks/src/search-form/
```

**Expected files:**

```
search-form/
├── block.json          ✅ Already exists
├── index.tsx           ✅ Already exists (edit component)
├── render.php          ⚠️ If exists, DELETE
├── save.tsx            ❌ Need to ADD
├── hooks/
│   └── useVoxelFilters.ts  ❌ Need to ADD
└── style.scss          ✅ Already exists
```

### Conversion Steps

#### Step 1: Remove Server-Side Rendering (30 min per block)

```bash
# Delete render.php if it exists
rm themes/voxel-fse/app/blocks/src/search-form/render.php
rm themes/voxel-fse/app/blocks/src/create-post/render.php
rm themes/voxel-fse/app/blocks/src/popup-kit/render.php
```

**Update block.json:**

```json
// ❌ Remove this line:
"render": "file:./render.php",

// ✅ Keep only:
{
"editorScript": "file:./index.js",
"editorStyle": "file:./editor.css",
"style": "file:./style.css"
}
```

#### Step 2: Add Save Function (1 hour per block)

**Create save.tsx:**

```tsx
// themes/voxel-fse/app/blocks/src/search-form/save.tsx

export default function save({attributes}) {
    return (
        <div
            className="ts-form ts-search-widget voxel-fse-search-form"
            data-post-type={attributes.postType}
            data-enabled-filters={JSON.stringify(attributes.enabledFilters || [])}
            data-filter-source={attributes.filterSource || 'voxel-api'}
            data-submit-behavior={attributes.submitBehavior || 'refresh'}
        >
            {/* Placeholder for Next.js hydration */}
            <div className="voxel-fse-block-placeholder">
                <span className="placeholder-text">Search Form</span>
            </div>
        </div>
    );
}
```

**Update index.tsx:**

```tsx
// themes/voxel-fse/app/blocks/src/search-form/index.tsx

import {registerBlockType} from '@wordpress/blocks';
import Edit from './edit';
import save from './save';  // ⭐ Import save function

registerBlockType('voxel-fse/search-form', {
    edit: Edit,
    save: save,  // ⭐ Add save function
});
```

#### Step 3: Add Voxel API Hook (2 hours per block)

**Create useVoxelFilters hook:**

```tsx
// themes/voxel-fse/app/blocks/src/search-form/hooks/useVoxelFilters.ts

import {useState, useEffect} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export interface VoxelFilter {
    key: string;
    label: string;
    type: string;
    props: Record<string, any>;
}

export function useVoxelFilters(postTypeKey: string | null) {
    const [filters, setFilters] = useState<VoxelFilter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postTypeKey) {
            setFilters([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        apiFetch<VoxelFilter[]>({
            path: `/voxel/v1/post-type-filters?post_type=${postTypeKey}`
        })
            .then(data => {
                setFilters(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [postTypeKey]);

    return {filters, isLoading, error};
}
```

**Update edit.tsx to use hook:**

```tsx
// themes/voxel-fse/app/blocks/src/search-form/edit.tsx

import {useVoxelFilters} from './hooks/useVoxelFilters';

export default function Edit({attributes, setAttributes}) {
    const {filters, isLoading, error} = useVoxelFilters(attributes.postType);

    if (isLoading) {
        return <Spinner/>;
    }

    return (
        <>
            <InspectorControls>
                {/* Inspector panels */}
            </InspectorControls>

            <div className="voxel-fse-search-form-editor">
                {filters.map(filter => (
                    <FilterPreview key={filter.key} filter={filter}/>
                ))}
            </div>
        </>
    );
}
```

#### Step 4: Repeat for Other 2 Blocks

**create-post/hooks/useVoxelFields.ts:**

```tsx
export function useVoxelFields(postTypeKey: string | null) {
    // Similar to useVoxelFilters but for fields
    const [fields, setFields] = useState<VoxelField[]>([]);
    // ... implementation
}
```

**popup-kit:** (Simpler, no API needed)

```tsx
export default function save({attributes}) {
    return (
        <div
            className="voxel-fse-popup-kit"
            data-popup-config={JSON.stringify(attributes.popupConfig)}
            data-trigger={attributes.trigger}
        >
            {/* Popup content */}
        </div>
    );
}
```

### Phase 1 Timeline

| Task                         | Time         | Total                   |
|------------------------------|--------------|-------------------------|
| Remove render.php (3 blocks) | 30 min each  | 1.5 hours               |
| Add save.tsx (3 blocks)      | 1 hour each  | 3 hours                 |
| Add API hooks (2 blocks)     | 2 hours each | 4 hours                 |
| Update edit.tsx (3 blocks)   | 1 hour each  | 3 hours                 |
| Testing (3 blocks)           | 1 hour each  | 3 hours                 |
| **TOTAL**                    |              | **14.5 hours (2 days)** |

**Result:** 3 blocks converted to Option C+ ✅

---

## Phase 2: Convert 31 Voxel Widgets to Option C+ FSE (Week 3-16)

### Strategy: Batch Conversion

**Group blocks by complexity:**

### Tier 1: Simple Blocks (10 blocks, 1 day each)

```
□ Product Price (VX)         - Display only, minimal config
□ Event Date (VX)            - Display only
□ Venue Location (VX)        - Display only
□ User Avatar (VX)           - Display only
□ Rating Display (VX)        - Display only
□ Social Share (VX)          - Static buttons
□ Breadcrumbs (VX)           - Static navigation
□ Back Button (VX)           - Simple link
□ Print Button (VX)          - Simple action
□ Map Marker (VX)            - Static marker
```

**Template for Tier 1:**

```tsx
// Tier 1 Template: Display-only blocks

// block.json
{
    "name"
:
    "voxel-fse/product-price",
        "attributes"
:
    {
        "postId"
    :
        {
            "type"
        :
            "number"
        }
    ,
        "currencyFormat"
    :
        {
            "type"
        :
            "string", "default"
        :
            "USD"
        }
    }
}

// index.tsx
import {registerBlockType} from '@wordpress/blocks';

registerBlockType('voxel-fse/product-price', {
    edit: ({attributes}) => (
        <div className="voxel-product-price-editor">
            ${/* Preview price */}
        </div>
    ),

    save: ({attributes}) => (
        <div
            className="voxel-product-price"
            data-post-id={attributes.postId}
            data-currency={attributes.currencyFormat}
        >
            {/* Placeholder */}
        </div>
    ),
});
```

**Time: 1 day × 10 blocks = 10 days (2 weeks)**

---

### Tier 2: Medium Complexity (15 blocks, 2 days each)

```
□ Post Feed (VX)             - Query + filters, uses REST API
□ Event Listings (VX)        - Query + filters
□ Venue Directory (VX)       - Query + filters
□ Product Grid (VX)          - Query + filters
□ Reviews List (VX)          - Query + pagination
□ Related Posts (VX)         - Dynamic query
□ Author Posts (VX)          - Dynamic query
□ Category Posts (VX)        - Dynamic query
□ Image Gallery (VX)         - Media query
□ Video Gallery (VX)         - Media query
□ File Attachments (VX)      - Media query
□ Custom Field Display (VX)  - Dynamic fields
□ Taxonomy List (VX)         - Taxonomy query
□ Tag Cloud (VX)             - Taxonomy query
□ User Profile (VX)          - User query + fields
```

**Template for Tier 2:**

```tsx
// Tier 2 Template: Query-based blocks

// hooks/useVoxelPosts.ts
export function useVoxelPosts(query: VoxelQuery) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        apiFetch({
            path: `/voxel/v1/posts?${buildQueryString(query)}`
        }).then(setPosts);
    }, [query]);

    return {posts, isLoading};
}

// index.tsx
registerBlockType('voxel-fse/post-feed', {
    edit: ({attributes}) => {
        const {posts, isLoading} = useVoxelPosts(attributes.query);

        return (
            <div className="voxel-post-feed-editor">
                {posts.map(post => <PostPreview post={post}/>)}
            </div>
        );
    },

    save: ({attributes}) => (
        <div
            className="voxel-post-feed"
            data-query={JSON.stringify(attributes.query)}
            data-post-type={attributes.postType}
            data-filters={JSON.stringify(attributes.filters)}
        >
            {/* Placeholder */}
        </div>
    ),
});
```

**Time: 2 days × 15 blocks = 30 days (6 weeks)**

---

### Tier 3: Complex Blocks (6 blocks, 3-4 days each)

```
□ Booking Calendar (VX)      - Complex availability logic
□ Booking Form (VX)          - Multi-step form with validation
□ Order Summary (VX)         - Cart/checkout integration
□ Advanced Search (VX)       - Complex filters + facets
□ Timeline Feed (VX)         - Supabase integration + real-time
□ Chat Widget (VX)           - Supabase integration + real-time
```

**Template for Tier 3:**

```tsx
// Tier 3 Template: Complex interactive blocks

// hooks/useVoxelBookings.ts
export function useVoxelBookings(productId: number) {
    const [availability, setAvailability] = useState({});
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Fetch from Voxel REST API
        apiFetch({
            path: `/voxel/v1/bookings/availability?product=${productId}`
        }).then(setAvailability);
    }, [productId]);

    return {availability, bookings};
}

// index.tsx
registerBlockType('voxel-fse/booking-calendar', {
    edit: ({attributes}) => {
        const {availability} = useVoxelBookings(attributes.productId);

        return (
            <div className="voxel-booking-calendar-editor">
                <Calendar availability={availability}/>
            </div>
        );
    },

    save: ({attributes}) => (
        <div
            className="voxel-booking-calendar"
            data-product-id={attributes.productId}
            data-booking-config={JSON.stringify(attributes.bookingConfig)}
        >
            {/* Placeholder */}
        </div>
    ),
});
```

**Time: 3.5 days × 6 blocks = 21 days (4 weeks)**

---

### Phase 2 Timeline Summary

| Tier             | Blocks | Time per Block | Total Time   |
|------------------|--------|----------------|--------------|
| Tier 1 (Simple)  | 10     | 1 day          | 2 weeks      |
| Tier 2 (Medium)  | 15     | 2 days         | 6 weeks      |
| Tier 3 (Complex) | 6      | 3.5 days       | 4 weeks      |
| **TOTAL**        | **31** |                | **12 weeks** |

---

## Parallel Development Strategy

### Can You Do Both in Parallel?

**Yes! Here's how:**

### Week 1-2: Foundation (Sequential)

```
Developer 1: Voxel REST API controller
Developer 1: First block (search-form) Option C+ conversion
Developer 1: Document pattern
```

**Output:**

- ✅ Voxel REST API working
- ✅ Proven Option C+ pattern
- ✅ Documentation for team

---

### Week 3-16: Parallel Conversion (Parallel)

**Team Split:**

```
Developer 1 (Lead):
├─ Convert Tier 3 blocks (complex)
├─ Build shared hooks (useVoxelPosts, useVoxelBookings)
├─ Code review other developer's work
└─ Timeline: 6 weeks

Developer 2:
├─ Convert Tier 1 blocks (simple)
├─ Convert Tier 2 blocks (medium)
├─ Follow established pattern
└─ Timeline: 8 weeks

Developer 3 (Optional):
├─ Build Next.js frontend components
├─ ISR configuration
├─ Supabase integration
└─ Timeline: 12 weeks
```

**With 2 developers: 8 weeks (vs 12 weeks solo)**
**With 3 developers: 6 weeks (vs 12 weeks solo)**

---

## Shared Component Architecture

### Shared TypeScript Definitions

```tsx
// themes/voxel-fse/app/blocks/src/shared/types.ts

export interface VoxelFilter {
    key: string;
    label: string;
    type: 'location' | 'keywords' | 'date' | 'number' | 'select';
    props: Record<string, any>;
}

export interface VoxelField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'url' | 'file' | 'location';
    props: Record<string, any>;
}

export interface VoxelQuery {
    post_type: string;
    posts_per_page?: number;
    orderby?: string;
    order?: 'ASC' | 'DESC';
    tax_query?: any[];
    meta_query?: any[];
}
```

### Shared Hooks

```tsx
// themes/voxel-fse/app/blocks/src/shared/hooks/

useVoxelFilters.ts - Fetch
post
type filters
useVoxelFields.ts - Fetch
post
type fields
useVoxelPosts.ts - Query
posts
useVoxelTaxonomies.ts - Fetch
taxonomies
useVoxelBookings.ts - Fetch
booking
data
useVoxelOrders.ts - Fetch
order
data
```

### Shared Components

```tsx
// themes/voxel-fse/app/blocks/src/shared/components/

FilterPreview.tsx - Preview
filter in editor
FieldPreview.tsx - Preview
field in editor
PostPreview.tsx - Preview
post
card in editor
LoadingSpinner.tsx - Consistent
loading
state
ErrorMessage.tsx - Consistent
error
display
```

### Reusability

**WordPress Editor:**

```tsx
import {useVoxelFilters} from '@shared/hooks/useVoxelFilters';
import {FilterPreview} from '@shared/components/FilterPreview';
```

**Next.js Frontend:**

```tsx
// Can't import directly from WordPress
// Instead, recreate similar hooks using Next.js APIs

// apps/musicalwheel-frontend/lib/hooks/useVoxelFilters.ts
export function useVoxelFilters(postType: string) {
    // Fetch from WordPress API
    return useSWR(`/api/voxel/filters/${postType}`);
}
```

**Better approach: Share types only, implement separately**

```
WordPress:  useVoxelFilters (uses apiFetch)
Next.js:    useVoxelFilters (uses fetch/SWR)
Both:       VoxelFilter type definition (shared)
```

---

## Build System Updates

### Update vite.blocks.config.js

```js
// themes/voxel-fse/vite.blocks.config.js

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@shared': resolve(__dirname, './app/blocks/src/shared'),
            '@hooks': resolve(__dirname, './app/blocks/src/shared/hooks'),
            '@components': resolve(__dirname, './app/blocks/src/shared/components'),
            '@types': resolve(__dirname, './app/blocks/src/shared/types'),
        },
    },

    build: {
        rollupOptions: {
            input: {
                // Auto-discover all blocks
                ...discoverBlocks('./app/blocks/src'),
            },
            output: {
                entryFileNames: 'blocks/[name]/index.js',
                assetFileNames: 'blocks/[name]/[name].[ext]',
            },
        },
    },
});
```

---

## Complete Timeline: Accelerated Approach

### Solo Developer

| Phase       | Tasks                         | Duration                 |
|-------------|-------------------------------|--------------------------|
| **Phase 1** | Convert 3 existing FSE blocks | 2 days                   |
| **Phase 2** | Convert 31 Voxel widgets      | 12 weeks                 |
| **Phase 3** | Next.js frontend              | 4 weeks                  |
| **Phase 4** | Supabase integration          | 2 weeks                  |
| **Phase 5** | Testing & deployment          | 2 weeks                  |
| **TOTAL**   |                               | **~20 weeks (5 months)** |

### With 2 Developers

| Phase       | Tasks                               | Duration                 |
|-------------|-------------------------------------|--------------------------|
| **Phase 1** | Convert 3 existing FSE blocks       | 2 days                   |
| **Phase 2** | Convert 31 Voxel widgets (parallel) | 8 weeks                  |
| **Phase 3** | Next.js frontend (parallel)         | 8 weeks                  |
| **Phase 4** | Supabase integration                | 2 weeks                  |
| **Phase 5** | Testing & deployment                | 2 weeks                  |
| **TOTAL**   |                                     | **~12 weeks (3 months)** |

### With 3 Developers

| Phase         | Tasks                          | Duration                |
|---------------|--------------------------------|-------------------------|
| **Phase 1**   | Convert 3 existing FSE blocks  | 2 days                  |
| **Phase 2-4** | All parallel:                  | 6 weeks                 |
|               | • Convert widgets (Dev 1 & 2)  |                         |
|               | • Next.js frontend (Dev 3)     |                         |
|               | • Supabase integration (Dev 3) |                         |
| **Phase 5**   | Testing & deployment           | 2 weeks                 |
| **TOTAL**     |                                | **~8 weeks (2 months)** |

---

## Comparison: Old Plan vs New Plan

### Old Plan (Option A with Duplicated Code)

```
Build 3 blocks with Option A:      6 weeks
Build 31 blocks with Option A:     24 weeks
Refactor to Option C+ later:       8 weeks
────────────────────────────────────────
TOTAL:                             38 weeks (9 months)

Technical Debt: HIGH
Maintenance: HARD (2 codebases)
Future Voxel FSE migration: HARD
```

### New Plan (All Option C+)

```
Convert 3 blocks to Option C+:      2 days
Convert 31 widgets to Option C+:    12 weeks
Next.js frontend:                   4 weeks
Supabase integration:               2 weeks
Testing:                            2 weeks
────────────────────────────────────────
TOTAL:                             20 weeks (5 months)

Technical Debt: MINIMAL (unavoidable component duplication)
Maintenance: MODERATE (2 component files per block, but shared API)
Code Reuse: HIGH (both use same Voxel REST API for data)
Future Voxel FSE migration: EASY (70% faster)
```

**Savings: 18 weeks (4.5 months faster!)**

---

## Understanding "No Duplicated Code" in This Context

When we say "skip Option A entirely (no duplicated code)", we mean eliminating **architectural duplication** and *
*business logic duplication**, NOT component file count.

### ❌ Eliminating Architectural Duplication (Option A's Problem)

**Option A requires 3 implementations per block:**

```
search-form/
├── render.php          # 1. Server-side PHP rendering (WordPress frontend)
├── edit.tsx           # 2. WordPress editor component
└── frontend.tsx       # 3. Next.js headless frontend component

34 blocks × 3 files = 102 implementations
```

**The problem:**

- `render.php` duplicates the same rendering logic as `frontend.tsx`
- Both fetch filter data, both display the same UI, both handle the same interactions
- This is architectural waste - serving the same content two different ways

### ✅ Reducing to Minimal Duplication (Option C+)

**Option C+ requires 2 implementations per block:**

```
WordPress: themes/voxel-fse/app/blocks/src/search-form/
├── block.json         # Block definition (single source of truth)
├── edit.tsx          # WordPress editor component
└── save.tsx          # Saves static HTML with data attributes

Next.js: apps/musicalwheel-frontend/components/blocks/
└── SearchFormBlock.tsx  # Next.js frontend component

34 blocks × 2 files = 68 implementations
```

**Savings: 34 fewer files** (eliminating all `render.php` files)

### Why We Can't Eliminate the 2-File Pattern

**You MUST have two component files because:**

| Requirement     | WordPress Component                       | Next.js Component        |
|-----------------|-------------------------------------------|--------------------------|
| **Packages**    | @wordpress/components, @wordpress/element | Standard React, Next.js  |
| **Server**      | WordPress host (WP Engine)                | Vercel edge network      |
| **Data API**    | apiFetch (WordPress internal)             | fetch/SWR (external API) |
| **Purpose**     | Admin preview/editing                     | Customer display         |
| **Users**       | Site admins only                          | Public customers         |
| **Environment** | WordPress backend                         | Headless frontend        |

**They can't be the same file** - different packages, different servers, different purposes.

### What IS Shared (The Important Part)

**Both components fetch from the same Voxel REST API:**

```typescript
// WordPress: themes/voxel-fse/app/blocks/src/search-form/hooks/useVoxelFilters.ts
import apiFetch from '@wordpress/api-fetch';

export function useVoxelFilters(postTypeKey: string) {
    const data = await apiFetch({
        path: `/voxel/v1/post-type-filters?post_type=${postTypeKey}`
    });
    return data;
}

// Next.js: apps/musicalwheel-frontend/lib/hooks/useVoxelFilters.ts
import useSWR from 'swr';

export function useVoxelFilters(postTypeKey: string) {
    const {data} = useSWR(
        `https://wp.musicalwheel.com/wp-json/voxel/v1/post-type-filters?post_type=${postTypeKey}`
    );
    return data;
}
```

**Same endpoint, same data, same business logic** - just different component implementations.

### Comparison Table: What Gets Duplicated

| Aspect                         | Option A                                                  | Option C+                               |
|--------------------------------|-----------------------------------------------------------|-----------------------------------------|
| **Files per block**            | 3 (render.php + edit.tsx + frontend.tsx)                  | 2 (edit.tsx + SearchFormBlock.tsx)      |
| **Total files (34 blocks)**    | 102 implementations                                       | 68 implementations                      |
| **Business logic duplication** | ✗ HIGH (PHP fetch + render, React fetch + render)         | ✓ NONE (both use same API)              |
| **Component duplication**      | ✗ HIGH (3 implementations)                                | ⚠️ MINIMAL (2 implementations)          |
| **Data source**                | ✗ Duplicated (PHP queries DB directly, React queries API) | ✓ Single (both use Voxel REST API)      |
| **Rendering logic**            | ✗ Duplicated (PHP templates + React JSX do same thing)    | ✓ Shared (both render API data)         |
| **Maintenance**                | ✗ Update 3 files per change                               | ⚠️ Update 2 files per UI change         |
| **API changes**                | ✗ Update PHP logic + React logic                          | ✓ Update API once, both components work |

### Real-World Example: Adding a New Filter

**Option A (Architectural Duplication):**

```
1. Add filter in Voxel admin UI
2. Update render.php:
   - Add PHP code to fetch new filter
   - Add PHP template to display it
3. Update frontend.tsx:
   - Add React code to fetch new filter
   - Add JSX to display it
4. Update edit.tsx:
   - Add editor preview

= 3 files to update, 2 different languages, duplicated logic
```

**Option C+ (Component Duplication Only):**

```
1. Add filter in Voxel admin UI
2. API automatically returns new filter (no code change)
3. Update edit.tsx:
   - Add UI control if needed
4. Update SearchFormBlock.tsx:
   - Add UI rendering if needed

= 2 files to update (both React), NO logic duplication (API handles it)
```

### The Key Insight

**"No duplicated code" means:**

✅ No duplicated **business logic** (eliminated render.php)
✅ No duplicated **data fetching** (both use Voxel REST API)
✅ No duplicated **rendering approaches** (eliminated server-side PHP rendering)
✅ Single **source of truth** (Voxel database via API)

⚠️ But YES, **two component files** (unavoidable due to ecosystem differences)

**The 2-file pattern is structural, not wasteful:**

- WordPress editor needs @wordpress/components for admin UI
- Next.js frontend needs standard React for customer UI
- They serve different users on different servers
- The duplication is in the UI layer, not the business logic

**Comparison:**

- Option A: 102 files with duplicated logic
- Option C+: 68 files with shared logic

**Option C+ eliminates 34 files AND all business logic duplication** - that's what "no duplicated code" refers to.

---

## Action Plan: Start Today

### Week 1: Setup (Days 1-5)

**Day 1: Voxel REST API**

```bash
# Create Voxel API controller
touch themes/voxel-fse/app/controllers/voxel-api-controller.php

# Implement endpoints:
# - /voxel/v1/post-types
# - /voxel/v1/post-type-filters
# - /voxel/v1/post-type-fields
# - /voxel/v1/posts
```

**Day 2: Convert search-form**

```bash
# Remove render.php
rm themes/voxel-fse/app/blocks/src/search-form/render.php

# Create save.tsx
touch themes/voxel-fse/app/blocks/src/search-form/save.tsx

# Create useVoxelFilters hook
mkdir -p themes/voxel-fse/app/blocks/src/search-form/hooks
touch themes/voxel-fse/app/blocks/src/search-form/hooks/useVoxelFilters.ts
```

**Day 3: Convert create-post**

```bash
# Same process as search-form
# Create useVoxelFields hook
```

**Day 4: Convert popup-kit**

```bash
# Simpler - no API hook needed
# Just add save.tsx
```

**Day 5: Document pattern**

```bash
# Create documentation
touch docs/blocks/option-c-plus-pattern.md

# Include:
# - Block structure template
# - save() function examples
# - Hook implementation guide
# - Testing checklist
```

### Week 2-14: Convert 31 Blocks

**Follow tier-based approach:**

- Weeks 2-3: Tier 1 (10 simple blocks)
- Weeks 4-9: Tier 2 (15 medium blocks)
- Weeks 10-14: Tier 3 (6 complex blocks)

### Week 15-18: Next.js Frontend

- ISR configuration
- WPGraphQL integration
- Block renderers

### Week 19-20: Supabase & Testing

- Database setup
- Sync controller
- Final testing

---

## Key Takeaway

**You were 100% correct:**

✅ Convert existing 3 FSE blocks to Option C+ now
✅ Convert 31 Voxel widgets directly to Option C+ FSE
✅ Skip Option A entirely (no duplicated code)
✅ Use shared types/hooks for consistency
✅ Can parallelize with multiple developers

**Result:**

- 18 weeks faster than old plan
- Zero technical debt
- Future-proof for Voxel FSE
- Clean, maintainable architecture

**Start with converting the 3 existing blocks this week!** 🚀
