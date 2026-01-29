# Block Config Schema (vxconfig)

> **Architecture:** Option C+ Strategy
> **Last Updated:** January 2026

## Overview

WordPress `save.tsx` outputs a `<script class="vxconfig">` tag containing all block attributes as JSON. This enables headless consumers (Next.js) to:

1. **Parse** block configuration without DOM parsing
2. **Evaluate** visibility rules against current context
3. **Iterate** loop elements with proper data binding
4. **Apply** responsive styles programmatically

```html
<!-- Example output from save.tsx -->
<div class="voxel-fse-flex-container voxel-fse-flex-container-abc123">
    <script class="vxconfig" type="application/json">
    {
        "blockId": "abc123",
        "visibilityBehavior": "show",
        "visibilityRules": [...],
        "loopEnabled": false,
        ...
    }
    </script>
    <!-- Block content -->
</div>
```

---

## TypeScript Interfaces

### Core Config Interface

```typescript
interface VoxelBlockConfig {
    // Block identification
    blockId: string;
    elementId?: string;           // Custom CSS ID from AdvancedTab
    customClasses?: string;       // Custom CSS classes
    customAttributes?: string;    // key|value format

    // Visibility (server-side in Voxel, Next.js evaluated)
    visibilityBehavior?: 'show' | 'hide';
    visibilityRules?: VisibilityRule[];

    // Loop element (server-side in Voxel, Next.js evaluated)
    loopEnabled?: boolean;
    loopSource?: string;          // e.g., "@post.related_posts"
    loopProperty?: string;        // Property path in source data
    loopLimit?: number | '';
    loopOffset?: number | '';

    // Sticky position (CSS-based, already wired)
    stickyEnabled?: boolean;
    stickyDesktop?: 'sticky' | 'initial';
    stickyTablet?: 'sticky' | 'initial';
    stickyMobile?: 'sticky' | 'initial';
    stickyTop?: number;
    stickyTop_tablet?: number;
    stickyTop_mobile?: number;
    stickyTopUnit?: string;
    stickyLeft?: number;
    stickyLeftUnit?: string;
    stickyRight?: number;
    stickyRightUnit?: string;
    stickyBottom?: number;
    stickyBottomUnit?: string;

    // Responsive visibility (CSS-based, already wired)
    hideDesktop?: boolean;
    hideTablet?: boolean;
    hideMobile?: boolean;

    // ... block-specific attributes
}
```

---

## Visibility Rules

### Interface

```typescript
interface VisibilityRule {
    type: string;           // Rule type identifier (e.g., 'user:logged_in')
    args?: {                // Rule-specific arguments
        value?: string | string[] | boolean;
        [key: string]: any;
    };
}

interface VisibilityConfig {
    visibilityBehavior: 'show' | 'hide';
    visibilityRules: VisibilityRule[];
}
```

### Behavior Logic

```typescript
// When behavior = 'show':
//   - Show block if ALL rules pass
//   - Hide block if ANY rule fails

// When behavior = 'hide':
//   - Hide block if ALL rules pass
//   - Show block if ANY rule fails
```

### Available Rule Types

Based on Voxel parent theme (`themes/voxel/app/utils/visibility-rules/`):

#### User Rules

| Type | Description | Args |
|------|-------------|------|
| `user:logged_in` | User is logged in | none |
| `user:logged_out` | User is logged out | none |
| `user:role` | User has specific role | `value: string` (role slug) |
| `user:verified` | User is verified | none |
| `user:plan` | User has membership plan | `value: string` (plan ID) |
| `user:can_create_post` | User can create post type | `value: string` (post type) |
| `user:reached_submission_limit` | User hit submission limit | `value: string` (post type) |
| `user:reached_role_limit` | User hit role submission limit | `value: string` (post type) |
| `user:can_edit` | User can edit current post | none |
| `user:is_editing` | User is in edit mode | none |
| `user:following_author` | User follows post author | none |
| `user:followed_by_author` | Author follows user | none |
| `user:bookmarked_post` | User bookmarked current post | none |
| `user:owns_post` | User owns current post | none |

#### Author Rules (Current Post Author)

| Type | Description | Args |
|------|-------------|------|
| `author:verified` | Post author is verified | none |
| `author:rating` | Author has rating comparison | `value: string`, `compare: string` |

#### Post Rules

| Type | Description | Args |
|------|-------------|------|
| `post:status` | Post has specific status | `value: string` (status) |
| `post:type` | Post is specific type | `value: string` (post type) |
| `post:has_reviews` | Post has reviews | none |
| `post:has_claims` | Post has claim requests | none |
| `post:is_claimed` | Post is claimed | none |
| `post:editable_by_user` | Post editable by current user | none |
| `post:field_is_set` | Post field has value | `value: string` (field key) |
| `post:is_boosted` | Post is currently boosted | none |
| `post:product_enabled` | Post has products enabled | none |
| `post:has_orders` | Post has orders | none |

#### Date/Time Rules

| Type | Description | Args |
|------|-------------|------|
| `datetime:day` | Current day matches | `value: string[]` (day names) |
| `datetime:time` | Current time in range | `start: string`, `end: string` |
| `datetime:date` | Current date in range | `start: string`, `end: string` |

#### Other Rules

| Type | Description | Args |
|------|-------------|------|
| `site:page_is` | Current page matches | `value: string` (page slug) |
| `request:param` | URL param matches | `key: string`, `value: string` |
| `dtag:equals` | Dynamic tag equals value | `tag: string`, `value: string` |

### Example: Visibility Rules JSON

```json
{
    "visibilityBehavior": "show",
    "visibilityRules": [
        {
            "type": "user:logged_in"
        },
        {
            "type": "user:role",
            "args": {
                "value": "subscriber"
            }
        }
    ]
}
```

---

## Loop Element

### Interface

```typescript
interface LoopConfig {
    loopEnabled: boolean;
    loopSource: string;       // Dynamic tag path
    loopProperty?: string;    // Optional sub-property
    loopLimit?: number | '';  // Max items (empty = unlimited)
    loopOffset?: number | ''; // Skip first N items
}
```

### Loop Source Format

Loop sources use Voxel's dynamic tag syntax:

```
@{context}.{property}

Examples:
@post.related_posts        → Related posts of current post
@post.gallery              → Gallery images of current post
@user.posts                → Posts by current user
@user.orders               → Orders for current user
@term.children             → Child terms of current term
@site.recent_posts         → Recent posts sitewide
```

### Example: Loop Config JSON

```json
{
    "loopEnabled": true,
    "loopSource": "@post.related_posts",
    "loopProperty": "",
    "loopLimit": 4,
    "loopOffset": 0
}
```

---

## Sticky Position

### Interface

```typescript
interface StickyConfig {
    stickyEnabled: boolean;

    // Per-device enable/disable
    stickyDesktop?: 'sticky' | 'initial';
    stickyTablet?: 'sticky' | 'initial';
    stickyMobile?: 'sticky' | 'initial';

    // Desktop offsets
    stickyTop?: number;
    stickyTopUnit?: string;      // 'px' | 'em' | 'rem' | '%' | 'vh'
    stickyLeft?: number;
    stickyLeftUnit?: string;
    stickyRight?: number;
    stickyRightUnit?: string;
    stickyBottom?: number;
    stickyBottomUnit?: string;

    // Tablet offsets (optional overrides)
    stickyTop_tablet?: number;
    stickyLeft_tablet?: number;
    stickyRight_tablet?: number;
    stickyBottom_tablet?: number;

    // Mobile offsets (optional overrides)
    stickyTop_mobile?: number;
    stickyLeft_mobile?: number;
    stickyRight_mobile?: number;
    stickyBottom_mobile?: number;
}
```

### CSS Generation (Already Wired)

Sticky position is CSS-based and already wired in `styles.ts`:

```css
/* Desktop (enabled) */
.voxel-fse-flex-container-abc123 {
    position: sticky;
    top: 20px;
}

/* Tablet (disabled) */
@media (max-width: 1024px) {
    .voxel-fse-flex-container-abc123 {
        position: relative;
        top: auto;
    }
}

/* Mobile (enabled with different offset) */
@media (max-width: 767px) {
    .voxel-fse-flex-container-abc123 {
        position: sticky;
        top: 10px;
    }
}
```

---

## Responsive Visibility

### Interface

```typescript
interface ResponsiveVisibilityConfig {
    hideDesktop?: boolean;
    hideTablet?: boolean;
    hideMobile?: boolean;
}
```

### CSS Classes (Already Wired)

```css
/* Generated by combineBlockClasses() */
.voxel-hide-desktop { /* hide on desktop */ }
.voxel-hide-tablet { /* hide on tablet */ }
.voxel-hide-mobile { /* hide on mobile */ }
```

---

## Full Example: vxconfig JSON

```json
{
    "blockId": "flex-abc123",
    "elementId": "hero-section",
    "customClasses": "my-custom-class",
    "customAttributes": "data-section|hero\naria-label|Hero Section",

    "visibilityBehavior": "show",
    "visibilityRules": [
        { "type": "user:logged_in" },
        { "type": "post:type", "args": { "value": "place" } }
    ],

    "loopEnabled": false,
    "loopSource": "",
    "loopProperty": "",
    "loopLimit": "",
    "loopOffset": "",

    "stickyEnabled": true,
    "stickyDesktop": "sticky",
    "stickyTablet": "initial",
    "stickyMobile": "sticky",
    "stickyTop": 80,
    "stickyTopUnit": "px",
    "stickyTop_mobile": 60,

    "hideDesktop": false,
    "hideTablet": false,
    "hideMobile": false,

    "direction": "row",
    "gap": 20,
    "gapUnit": "px",
    "justifyContent": "flex-start",
    "alignItems": "stretch"
}
```

---

## Next.js Implementation Reference

Ready-to-use utility files in `docs/headless-architecture/nextjs-utilities/`:

| File | Purpose |
|------|---------|
| `index.ts` | Barrel export for all utilities |
| `visibility.ts` | Visibility rule evaluation (34 rule types) |
| `loop.ts` | Loop iteration and data binding |
| `context.ts` | Block context types and provider |
| `withVoxelFeatures.tsx` | HOC wrapper + hooks |
| `example-usage.tsx` | Usage examples and patterns |

**To use:** Copy `nextjs-utilities/` folder to `apps/musicalwheel-frontend/lib/blocks/`

### Quick Reference: Evaluation Logic

```typescript
// Visibility
function shouldRender(config: VoxelBlockConfig, context: BlockContext): boolean {
    if (!config.visibilityRules?.length) return true;

    const allRulesPass = config.visibilityRules.every(rule =>
        evaluateRule(rule, context)
    );

    return config.visibilityBehavior === 'show'
        ? allRulesPass
        : !allRulesPass;
}

// Loop
function getLoopItems(config: VoxelBlockConfig, context: BlockContext): any[] {
    if (!config.loopEnabled || !config.loopSource) return [null];

    let items = resolveDynamicTag(config.loopSource, context);
    if (!Array.isArray(items)) return [null];

    if (config.loopOffset) items = items.slice(Number(config.loopOffset));
    if (config.loopLimit) items = items.slice(0, Number(config.loopLimit));

    return items.length ? items : [null];
}
```

---

## Related Documentation

- [Option C+ Strategy](./01-accelerated-option-c-plus-strategy.md) - Architecture overview
- [Dynamic Tags](../voxel-documentation/) - VoxelScript syntax reference
- [Block Conversions](../block-conversions/) - Widget conversion guides
