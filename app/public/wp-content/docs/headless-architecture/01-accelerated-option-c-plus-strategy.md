# Accelerated Option 3 Strategy (Hybrid Transitional Model)

**Date:** January 2026
**Goal:** Convert ALL blocks to Option 3 (WPGraphQL) while maintaining PHP Previews
**Blocks:** 3 existing FSE + 31 Voxel widgets = 34 total

---

## The Accelerated Plan

### ❌ OLD Plan (Option A)

3 Implementations per block: `render.php` (PHP), `edit.tsx` (WP React), `frontend.tsx` (Next.js).
**Problem:** Massive duplication of business logic.

### ✅ NEW Plan (Hybrid Option 3)

2 Implementations per block + 1 Transitional Shim.

1. **WordPress (Editor):** `edit.tsx` (Configuration).
2. **Next.js (Frontend):** React Component (Consumption).
3. **Transitional Shim:** `render.php` + `save.tsx` (For PHP Preview *only*).

**Why this wins:**

* You pass data via **GraphQL Attributes** (clean, typesafe).
* You keep `render.php` **temporarily** so you can verifies blocks locally without the Next.js app ready.
* Next.js ignores the Shim.

**Timeline:** 12-16 weeks (vs 30 weeks).

---

## Corrected Project Structure

```
musicalwheel/
│
├── wp-content/
│   └── themes/
│       ├── voxel-fse/                # ⭐ Child theme
│       │   ├── app/
│       │   │   ├── blocks/
│       │   │   │   └── src/          # ⭐ All blocks here
│       │   │   │       ├── search-form/
│       │   │   │       │   ├── block.json       # Source of Truth
│       │   │   │       │   ├── index.tsx        # Registration
│       │   │   │       │   ├── edit.tsx         # Editor UI
│       │   │   │       │   ├── save.tsx         # vxconfig Generator (Preview)
│       │   │   │       │   ├── render.php       # Visibility Logic (Preview)
│       │   │   │       │   └── frontend.js      # Voxel JS (Preview)
```

---

## Phase 0: The Hybrid Workflow (Transitional)

**Constraint:** Next.js app is not ready. Need PHP Preview.

### The "Mirror" Pattern

You will maintain `render.php` solely to mirror the logic that will eventually live in Next.js.

| Feature           | WP Preview (Now)                   | Headless App (Future)     |
|:------------------|:-----------------------------------|:--------------------------|
| **Logic Engine**  | PHP (`render.php`)                 | TypeScript (Next.js)      |
| **Visibility**    | `Visibility_Evaluator::evaluate()` | `useVisibility()` Hook    |
| **Config Data**   | `<script class="vxconfig">`        | GraphQL `attributes` Prop |
| **Interactivity** | Voxel Vue.js (Legacy)              | React Components          |

**Crucial:** Next.js ignores `render.php` and `save.tsx`. They are "Dev Tools" for you.

---

## Phase 1: Convert 3 Existing FSE Blocks (Week 1-2)

### Step 1: Update `block.json` (Do NOT remove `render.php`)

Keep `render` pointing to the file so PHP Preview works.

```json
{
  "editorScript": "file:./index.js",
  "viewScript": "file:./frontend.js",
  "render": "file:./render.php"
}
```

### Step 2: Implement Hybrid `save.tsx`

Use `save.tsx` to generate the `vxconfig` so Voxel JS works in Preview.

```tsx
export default function save({attributes}) {
    // 1. Build Voxel Config Object
    const vxConfig = {
        blockId: attributes.blockId,
        postTypes: attributes.postTypes,
        // ... map other attributes
    };

    return (
        <div className={`voxel-fse-block-${attributes.blockId}`}>
            {/* Output Script for Voxel JS */}
            <script
                type="text/json"
                className="vxconfig"
                dangerouslySetInnerHTML={{__html: JSON.stringify(vxConfig)}}
            />
        </div>
    );
}
```

### Step 3: Implement Hybrid `render.php`

Use `render.php` to handle Visibility Logic in PHP.

```php
<?php
// 1. Evaluate Visibility
$should_render = \VoxelFSE\Visibility_Evaluator::evaluate($attributes['visibilityRules']);
if (!$should_render) return;

// 2. Output Content (from save.tsx)
// This outputs the HTML + vxconfig script
echo $content; 
?>
```

---

## Phase 2: Convert 31 Voxel Widgets (Week 3-16)

**Group blocks by complexity (Same Tiers as before):**

### Tier 1: Simple Blocks (10 blocks)

*Products, Dates, Locations, Avatars.*

### Tier 2: Medium/Query Blocks (15 blocks)

*Post Feed, Listing Grids, Galleries.*

* **Editor:** `edit.tsx` uses `useVoxelPosts` (REST API).
* **Preview:** `render.php` uses PHP Loop.
* **Headless:** Next.js uses `useQuery` (GraphQL).

### Tier 3: Complex Blocks (6 blocks)

*Booking, Search, orders.*

---

## Phase 3: The Headless Logic (The "New render.php")

You will create a Higher-Order Component in Next.js that wraps every block to replicate the logic currently handled by
`render.php`.

**Location:** `apps/frontend/components/BlockWrapper.tsx`

```tsx
export function BlockWrapper({block, children}) {
    const {attributes} = block;

    // 1. Re-implement Visibility Logic (Client-Side)
    // Replaces: Visibility_Evaluator::evaluate()
    if (attributes.visibilityRules) {
        const isVisible = useVisibilityEvaluator(attributes.visibilityRules);
        if (!isVisible) return null; // Logic moved to React!
    }

    // 2. Re-implement Loop Logic (Client-Side)
    // Replaces: Loop_Processor::render_looped()
    if (attributes.loopSource) {
        const loopItems = useLoopSource(attributes.loopSource);
        return loopItems.map(item => (
            <BlockComponent {...attributes} context={item}/>
        ));
    }

    // 3. Normal Render
    return children;
}
```

### Step: Port Style Generation Utilities to Next.js

The WordPress editor uses centralized style generation utilities that must be ported to Next.js for consistent styling.

**Source Files (WordPress - Pure TypeScript, no WP dependencies):**

| Utility | Location | Purpose |
|:--------|:---------|:--------|
| `generateVoxelStyles()` | `shared/utils/generateVoxelStyles.ts` | Sticky position CSS |
| `generateAdvancedStyles()` | `shared/utils/generateAdvancedStyles.ts` | Margin, padding, border, background |
| `getAdvancedVoxelTabProps()` | `shared/utils/useAdvancedTabProps.ts` | Combined entry point |

**Target Location:** `apps/frontend/utils/styles/`

**Action:** Copy and adapt these utilities when starting Next.js implementation. They are pure TypeScript functions with no WordPress dependencies, requiring minimal changes.

**Already Ported (in `docs/headless-architecture/nextjs-utilities/`):**
- `evaluateVisibility()` - Visibility rules evaluation
- `resolveLoop()` - Loop source resolution
- `withVoxelFeatures()` - HOC combining visibility + loop

**CSS Generation Architecture:**

Block-specific CSS (from InlineTab, StyleTab, etc.) requires special handling due to Gutenberg validation issues. During the transitional period, CSS is generated server-side via `style-generator.php` and injected via `render_block` filter.

See **[14-css-generation-architecture.md](14-css-generation-architecture.md)** for:
- Why PHP CSS generation exists (Gutenberg validation issue)
- How to port styles.ts to Next.js
- Portal element handling
- Migration status and priority

---

## Parallel Development Strategy

**Yes! Here's how:**

### Week 1-2: Foundation

* Developer 1: Sets up `Visibility_Evaluator` (PHP) and `block.json` schemas.

### Week 3-16: Parallel Execution

* **Developer 1 (Blocks):** Builds `edit.tsx` + `render/save` shim for 31 blocks. Verifies in PHP Preview.
* **Developer 2 (Headless):** Builds Next.js app. Maps `attributes` to React Components. Ignores `render.php`.

---

## Technical Debt Note

**"Isn't this maintaining duplicate code?"**
Yes, but strictly for **Previewing**.

* You write the logic in PHP (`render.php`) to see it now.
* You write the logic in React (Next.js) for the final product.
* **Benefit:** You are unblocked. You can build 100% of the blocks before the Headless App is even started.

**Savings:** Still ~14 weeks faster than building two full versions of the site.
