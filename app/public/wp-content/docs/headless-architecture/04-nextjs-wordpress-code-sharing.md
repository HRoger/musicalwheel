# Next.js and WordPress Code Sharing Explained

**Date:** December 2025
**Question:** Can Next.js import WordPress block components directly?

---

## The Short Answer: NO

**You CANNOT do this:**
```typescript
❌ import SearchFormComponent from '../../../wordpress/wp-content/themes/voxel-fse/app/blocks/src/search-form/SearchFormComponent';
```

**Why:**
- WordPress and Next.js are **separate applications**
- They run on **different servers** (WordPress host vs Vercel)
- They don't share a file system
- Next.js on Vercel has NO access to WordPress files

---

## How It Actually Works

### Architecture Reality

```
┌─────────────────────────────────────────────────────────────┐
│                    WORDPRESS (WP Engine)                     │
├─────────────────────────────────────────────────────────────┤
│  wp-content/themes/voxel-fse/app/blocks/src/search-form/    │
│  ├── block.json                                              │
│  ├── index.tsx                    ⭐ Editor component        │
│  ├── edit.tsx                        (WordPress admin only)  │
│  └── save.tsx                                                │
│                                                               │
│  Runs: PHP + React (WordPress packages)                     │
│  Access: Admins only                                         │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ NO DIRECT IMPORTS
                             │
                             ▼
                    API Communication Only
                    (JSON over HTTP/GraphQL)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS (Vercel)                          │
├─────────────────────────────────────────────────────────────┤
│  components/blocks/SearchFormBlock.tsx  ⭐ Frontend component│
│                                            (Separate file!)  │
│                                                               │
│  Runs: Node.js + React                                       │
│  Access: Public customers                                    │
└─────────────────────────────────────────────────────────────┘
```

### You Build Components TWICE

**1. WordPress Editor Component (for admin preview)**

```tsx
// WordPress: themes/voxel-fse/app/blocks/src/search-form/edit.tsx

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useVoxelFilters } from './hooks/useVoxelFilters';

export default function Edit({ attributes, setAttributes }) {
  const { filters } = useVoxelFilters(attributes.postType);

  return (
    <>
      <InspectorControls>
        <PanelBody title="Settings">
          <SelectControl
            label="Post Type"
            value={attributes.postType}
            onChange={(value) => setAttributes({ postType: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div className="voxel-search-form-editor">
        {filters.map(filter => (
          <FilterComponent key={filter.key} filter={filter} />
        ))}
      </div>
    </>
  );
}
```

**Uses:**
- `@wordpress/block-editor` (WordPress-specific packages)
- `@wordpress/components` (WordPress UI components)
- Runs in WordPress admin only

---

**2. Next.js Frontend Component (for customers)**

```tsx
// Next.js: components/blocks/SearchFormBlock.tsx

'use client';

import { useState } from 'react';
import useSWR from 'swr';

interface SearchFormBlockProps {
  attributes: {
    postType: string;
    enabledFilters: string[];
  };
  filterDefinitions: any[];
}

export function SearchFormBlock({ attributes, filterDefinitions }: SearchFormBlockProps) {
  const [activeFilters, setActiveFilters] = useState({});

  return (
    <div className="voxel-search-form">
      {filterDefinitions.map(filter => (
        <FilterComponent
          key={filter.key}
          filter={filter}
          onChange={(value) => setActiveFilters({ ...activeFilters, [filter.key]: value })}
        />
      ))}
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
```

**Uses:**
- Standard React (not WordPress packages)
- `useSWR` or other data fetching
- Runs on customer-facing site

---

## The Components Are Similar But Separate

**They look similar, but they're DIFFERENT files:**

| Aspect | WordPress Component | Next.js Component |
|--------|---------------------|-------------------|
| **File location** | `wordpress/themes/voxel-fse/app/blocks/src/search-form/edit.tsx` | `nextjs/components/blocks/SearchFormBlock.tsx` |
| **Purpose** | Admin preview in editor | Customer-facing display |
| **Packages** | `@wordpress/*` | Standard React |
| **Data source** | `apiFetch` (WordPress internal) | `fetch` / `useSWR` (external API) |
| **Users** | Admins only | Public customers |
| **Server** | WordPress host | Vercel |

---

## How Data Flows

### Step 1: Admin Creates Content in WordPress

```tsx
// WordPress editor (admin uses this)
<SearchFormBlock
  postType="events"
  enabledFilters={['location', 'date']}
/>
```

**Saves to database:**
```html
<!-- wp_posts.post_content -->
<div
  class="voxel-search-form"
  data-post-type="events"
  data-enabled-filters='["location","date"]'
>
  Search Form Placeholder
</div>
```

---

### Step 2: Next.js Fetches via GraphQL

```typescript
// Next.js: app/events/page.tsx

import { client } from '@/lib/wordpress';

export default async function EventsPage() {
  // Fetch page content from WordPress
  const { data } = await client.query({
    query: gql`
      query GetPage($slug: String!) {
        page(id: $slug, idType: URI) {
          blocks {
            name
            attributes
          }
        }
      }
    `,
    variables: { slug: 'events' }
  });

  return (
    <div>
      {data.page.blocks.map(block => (
        <BlockRenderer key={block.name} block={block} />
      ))}
    </div>
  );
}
```

**Returns JSON:**
```json
{
  "name": "voxel-fse/search-form",
  "attributes": {
    "postType": "events",
    "enabledFilters": ["location", "date"]
  }
}
```

---

### Step 3: Next.js Renders with Separate Component

```tsx
// Next.js: components/BlockRenderer.tsx

import { SearchFormBlock } from './blocks/SearchFormBlock';
import { CreatePostBlock } from './blocks/CreatePostBlock';

export function BlockRenderer({ block }) {
  switch (block.name) {
    case 'voxel-fse/search-form':
      return <SearchFormBlock attributes={block.attributes} />;

    case 'voxel-fse/create-post':
      return <CreatePostBlock attributes={block.attributes} />;

    default:
      return null;
  }
}
```

**Renders on customer site:**
```tsx
<SearchFormBlock
  attributes={{
    postType: "events",
    enabledFilters: ["location", "date"]
  }}
/>
```

---

## Why You Can't Share Code Directly

### File System Separation

**WordPress files:**
```
WP Engine Server (wp.musicalwheel.com)
├── /var/www/html/
│   └── wp-content/themes/voxel-fse/
│       └── app/blocks/src/search-form/
│           └── SearchFormComponent.tsx  ← Lives here
```

**Next.js files:**
```
Vercel Edge Network (musicalwheel.com)
├── /vercel/serverless/
│   └── components/blocks/
│       └── SearchFormBlock.tsx  ← Lives here (different server!)
```

**They can't see each other's files!**

---

## Options for Code Sharing

### Option 1: Duplicate Components (RECOMMENDED for simplicity)

**Pros:**
- ✅ Simple to understand
- ✅ No complex build process
- ✅ Each app optimized independently
- ✅ No shared dependencies

**Cons:**
- ⚠️ Duplicate code (maintain twice)
- ⚠️ Must sync changes manually

**When to use:** Small team, 34 blocks, want simplicity

---

### Option 2: Shared NPM Package (Advanced)

**Create shared package:**

```
musicalwheel-shared/              # Separate npm package
├── src/
│   ├── types/
│   │   ├── VoxelFilter.ts
│   │   └── VoxelField.ts
│   ├── utils/
│   │   ├── filterHelpers.ts
│   │   └── formatters.ts
│   └── components/
│       ├── FilterComponent.tsx    # Pure React (no WordPress deps)
│       └── FieldComponent.tsx
├── package.json
└── tsconfig.json
```

**Publish to npm:**
```bash
cd musicalwheel-shared
npm publish
```

**Install in both projects:**
```bash
# WordPress
cd themes/voxel-fse
npm install @musicalwheel/shared

# Next.js
cd musicalwheel-nextjs
npm install @musicalwheel/shared
```

**Use in both:**
```tsx
// WordPress
import { VoxelFilter } from '@musicalwheel/shared/types';
import { FilterComponent } from '@musicalwheel/shared/components';

// Next.js
import { VoxelFilter } from '@musicalwheel/shared/types';
import { FilterComponent } from '@musicalwheel/shared/components';
```

**Pros:**
- ✅ True code sharing
- ✅ Single source of truth
- ✅ npm versioning

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires npm publishing
- ⚠️ Versioning management

**When to use:** Large team, many blocks, want DRY code

---

### Option 3: Monorepo with Workspaces (Most Advanced)

**Project structure:**
```
musicalwheel/                      # Git root
├── packages/
│   ├── shared/                    # Shared code
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── components/
│   │   └── package.json
│   │
│   ├── wordpress-blocks/          # WordPress blocks
│   │   ├── src/
│   │   │   └── search-form/
│   │   └── package.json
│   │
│   └── nextjs-frontend/           # Next.js app
│       ├── app/
│       ├── components/
│       └── package.json
│
├── package.json                   # Root package.json
└── pnpm-workspace.yaml           # Workspace config
```

**Root package.json:**
```json
{
  "name": "musicalwheel-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

**Import across packages:**
```tsx
// packages/wordpress-blocks/src/search-form/edit.tsx
import { FilterComponent } from '@musicalwheel/shared';

// packages/nextjs-frontend/components/blocks/SearchFormBlock.tsx
import { FilterComponent } from '@musicalwheel/shared';
```

**Pros:**
- ✅ True code sharing
- ✅ Single repository
- ✅ Easy to sync changes
- ✅ Shared dependencies

**Cons:**
- ⚠️ Complex setup
- ⚠️ Requires workspace tooling (npm/yarn/pnpm workspaces)
- ⚠️ Larger repository

**When to use:** Large team, complex project, want maximum code reuse

---

## Clarifying "Duplication" - What It Really Means

Before diving into the recommended approach, let's clarify the **apparent contradiction** in the documentation: Option C+ claims "no duplication" but you're clearly building components twice. Here's what's actually happening.

### ❌ What Option C+ Does NOT Duplicate (The Important Part)

**Business Logic:**
```typescript
// WordPress edit.tsx
const { filters } = useVoxelFilters(postType);  // Calls /voxel/v1/post-type-filters

// Next.js SearchFormBlock.tsx
const { filters } = useSWR(`/api/voxel/filters/${postType}`);  // Calls same endpoint

// Both fetch from SAME API - no logic duplication!
```

**Data Source:**
- WordPress doesn't hardcode filter definitions
- Next.js doesn't hardcode filter definitions
- Both get filters from Voxel database via API
- Change Voxel config once → updates both automatically

**Rendering Logic:**
- No render.php file (eliminated server-side PHP rendering)
- WordPress editor uses Voxel REST API
- Next.js frontend uses same Voxel REST API
- Single source of truth for all configuration

### ✅ What Option C+ DOES Duplicate (Unavoidable)

**Component Implementation:**
```typescript
// WordPress uses WordPress packages
import { TextControl } from '@wordpress/components';
<TextControl label="Search" />

// Next.js uses standard React/HTML
<input type="text" placeholder="Search" />
```

**Why this is unavoidable:**
- `@wordpress/components` only works in WordPress environment
- Vercel doesn't have access to @wordpress packages
- Different servers, different ecosystems
- This is structural, not a design flaw

### 📊 Comparison: Option A vs Option C+

**Option A (Hybrid SSR) - Duplicates EVERYTHING:**
```
render.php (PHP):
  - Fetch filters from Voxel\Post_Type::get()->get_filters()
  - Render with PHP templates
  - Output HTML

frontend.tsx (React):
  - Fetch filters from REST API
  - Render with React components
  - Output HTML

Result: Same functionality implemented TWICE in different languages
```

**Option C+ (API-Driven) - Duplicates ONLY Components:**
```
edit.tsx (WordPress React):
  - Fetch filters from /voxel/v1/post-type-filters
  - Render with @wordpress/components
  - Preview in editor

SearchFormBlock.tsx (Next.js React):
  - Fetch filters from /voxel/v1/post-type-filters
  - Render with standard React
  - Display to customers

Result: Same API, different component libraries (unavoidable)
```

**The key difference:** Option A duplicates the business logic. Option C+ only duplicates the UI layer.

### What "Duplication" Means in Different Contexts

| Statement | What It Actually Means |
|-----------|----------------------|
| "No duplication" | No duplicated rendering logic or business logic |
| "Build components twice" | Two component files (edit.tsx + SearchFormBlock.tsx) |
| "Duplicate code" | Component implementation (unavoidable due to different packages) |
| "Single source of truth" | Block configuration stored once (block.json) |
| "Shared API" | Both WordPress and Next.js fetch from same Voxel REST API |

### Real-World Impact

**Changing a Voxel Filter:**

**Option A:**
1. Update filter in Voxel admin
2. Update render.php logic (if needed)
3. Update frontend.tsx logic (if needed)
4. Test WordPress frontend
5. Test Next.js frontend
6. Both might have different implementations

**Option C+:**
1. Update filter in Voxel admin
2. Both WordPress editor and Next.js automatically see the change
3. No code changes needed (fetches from API)

**The component duplication doesn't matter** when the data source is shared!

---

## Recommended Approach for MusicalWheel

### Simple Approach: Duplicate Components

**Why:**
- ✅ You're just starting headless
- ✅ 34 blocks is manageable
- ✅ Simpler to understand and debug
- ✅ Faster initial development

**How it works:**

**1. WordPress Block Component**
```tsx
// themes/voxel-fse/app/blocks/src/search-form/edit.tsx

import { useVoxelFilters } from './hooks/useVoxelFilters';

export default function Edit({ attributes }) {
  const { filters } = useVoxelFilters(attributes.postType);

  return (
    <div className="voxel-search-form">
      {filters.map(filter => <Filter key={filter.key} {...filter} />)}
    </div>
  );
}
```

**2. Next.js Frontend Component (Similar but separate)**
```tsx
// musicalwheel-nextjs/components/blocks/SearchFormBlock.tsx

import useSWR from 'swr';

export function SearchFormBlock({ attributes, filterDefinitions }) {
  const [activeFilters, setActiveFilters] = useState({});

  return (
    <div className="voxel-search-form">
      {filterDefinitions.map(filter => <Filter key={filter.key} {...filter} />)}
    </div>
  );
}
```

**3. Share Only TypeScript Types (Copy/Paste)**

```tsx
// BOTH projects have this file (copy/paste)

// types/voxel.ts
export interface VoxelFilter {
  key: string;
  label: string;
  type: 'location' | 'keywords' | 'date' | 'number' | 'select';
  props: Record<string, any>;
}

export interface VoxelField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'url' | 'file';
  props: Record<string, any>;
}
```

**4. Maintain Both Manually**

When you update a block:
1. Update WordPress editor component
2. Update Next.js frontend component (similar changes)
3. Test both

**Is duplication bad?**
- Not for 34 blocks
- Components will diverge anyway (WordPress uses `@wordpress/*` packages, Next.js doesn't)
- Keeping them separate is clearer

---

## Code Duplication Example

### WordPress Component

```tsx
// themes/voxel-fse/app/blocks/src/search-form/components/LocationFilter.tsx

import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';

export function LocationFilter({ filter, value, onChange }) {
  return (
    <div className="voxel-location-filter">
      <TextControl
        label={filter.label}
        value={value?.address || ''}
        onChange={(address) => onChange({ ...value, address })}
      />
      {/* WordPress-specific map component */}
    </div>
  );
}
```

### Next.js Component (Similar but different packages)

```tsx
// musicalwheel-nextjs/components/filters/LocationFilter.tsx

import { useState } from 'react';

export function LocationFilter({ filter, value, onChange }) {
  return (
    <div className="voxel-location-filter">
      <input
        type="text"
        placeholder={filter.label}
        value={value?.address || ''}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
      />
      {/* Different map library (e.g., react-leaflet) */}
    </div>
  );
}
```

**See the difference?**
- WordPress: Uses `@wordpress/components` (TextControl)
- Next.js: Uses native `<input>` or custom component

**They HAVE to be different!**

---

## Communication Flow

### How Next.js Gets WordPress Block Data

**1. WordPress Admin Creates Block**
```tsx
Admin adds block with settings:
{
  postType: "events",
  enabledFilters: ["location", "date", "price"]
}
```

**2. WordPress Saves to Database**
```html
<div
  class="voxel-fse-search-form"
  data-post-type="events"
  data-enabled-filters='["location","date","price"]'
>
  Placeholder
</div>
```

**3. Next.js Queries via GraphQL**
```graphql
query GetPage {
  page(id: "events") {
    blocks {
      name          # "voxel-fse/search-form"
      attributes    # { postType: "events", ... }
    }
  }
}
```

**4. Next.js Fetches Filter Configuration**
```typescript
const filters = await fetch(
  `https://wp.musicalwheel.com/wp-json/voxel/v1/post-type-filters?post_type=events`
).then(r => r.json());
```

**5. Next.js Renders with Frontend Component**
```tsx
<SearchFormBlock
  attributes={{ postType: "events", ... }}
  filterDefinitions={filters}
/>
```

**NO FILE IMPORTS** - only API calls! 🚀

---

## Summary

### ❌ What You CANNOT Do

```typescript
// This will NEVER work
import SearchForm from '../../../wordpress/themes/voxel-fse/app/blocks/src/search-form/SearchFormComponent';
```

### ✅ What You MUST Do

**Build components twice:**

1. **WordPress Editor Component**
   - File: `themes/voxel-fse/app/blocks/src/search-form/edit.tsx`
   - Uses: `@wordpress/*` packages
   - Purpose: Admin preview

2. **Next.js Frontend Component**
   - File: `musicalwheel-nextjs/components/blocks/SearchFormBlock.tsx`
   - Uses: Standard React
   - Purpose: Customer display

**They communicate via API:**
```
WordPress (saves config) ──GraphQL/REST──► Next.js (fetches and renders)
```

### Sharing Options

| Option | Complexity | Benefit |
|--------|------------|---------|
| **Duplicate components** | ⭐ Simple | Clear separation |
| **NPM package** | ⭐⭐ Medium | Share types/utils |
| **Monorepo** | ⭐⭐⭐ Advanced | Maximum sharing |

**Recommended:** Start with duplication, add sharing later if needed.

---

## Next Steps

1. **Build WordPress blocks** in `themes/voxel-fse/app/blocks/src/`
2. **Create Next.js project** in new directory `c:\Users\musicalwheel-nextjs\`
3. **Build Next.js components** separately in `components/blocks/`
4. **Connect via API** using GraphQL/REST
5. **Deploy both** separately (WordPress host + Vercel)

No file imports between them - only API communication! 🎯
