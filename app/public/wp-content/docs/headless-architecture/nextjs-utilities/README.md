# Next.js Block Utilities

> **Status:** Ready to copy when Next.js app is created
> **Architecture:** Option C+ Strategy

## Overview

These utilities enable Voxel's visibility rules and loop features in the Next.js frontend. WordPress outputs the configuration in two ways:

1. **Data attributes** on the block element (visibility rules, loop config)
2. **vxconfig JSON** inside a `<script class="vxconfig">` tag (block-specific settings)

Next.js parses these and evaluates/renders accordingly.

---

## Installation

When the Next.js app is created:

```bash
# Copy utilities to your Next.js app
cp -r docs/headless-architecture/nextjs-utilities/* apps/musicalwheel-frontend/lib/blocks/
```

Then import from `@/lib/blocks`:

```typescript
import {
    withVoxelFeatures,
    useBlockContext,
    useLoopItem,
    evaluateVisibility,
    resolveLoop,
} from '@/lib/blocks';
```

---

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Barrel export for all utilities |
| `visibility.ts` | Evaluates 34 visibility rule types |
| `loop.ts` | Resolves loop sources with offset/limit |
| `context.ts` | BlockContext types and React provider |
| `withVoxelFeatures.tsx` | HOC wrapper + React hooks |
| `example-usage.tsx` | Complete usage patterns |

---

## Quick Start

### 1. Set Up Context Provider (Page Level)

```tsx
// app/posts/[slug]/page.tsx
import { BlockContextReact, buildBlockContext } from '@/lib/blocks';

export default async function PostPage({ params }) {
    const post = await fetchPost(params.slug);
    const user = await getCurrentUser();

    const blockContext = buildBlockContext({ post, user });

    return (
        <BlockContextReact.Provider value={blockContext}>
            <BlockRenderer blocks={post.content} />
        </BlockContextReact.Provider>
    );
}
```

### 2. Wrap Block Components with HOC

```tsx
// components/blocks/FlexContainerBlock.tsx
import { withVoxelFeatures } from '@/lib/blocks';

function FlexContainerBlock({ config, children }) {
    return (
        <div className={`voxel-fse-flex-container-${config.blockId}`}>
            {children}
        </div>
    );
}

// HOC adds visibility + loop support automatically
export default withVoxelFeatures(FlexContainerBlock);
```

### 3. Access Loop Data in Child Components

```tsx
// components/blocks/PostCardBlock.tsx
import { useLoopItem, useLoopValue, useIsInLoop } from '@/lib/blocks';

function PostCardBlock({ config }) {
    const isInLoop = useIsInLoop();
    const title = useLoopValue<string>('title');
    const loopItem = useLoopItem();

    if (!isInLoop) {
        return <div>Static content</div>;
    }

    return (
        <article>
            <h3>{title}</h3>
            <span>Item {loopItem.index + 1} of {loopItem.total}</span>
        </article>
    );
}

export default withVoxelFeatures(PostCardBlock);
```

---

## Features

### Visibility Rules

The `withVoxelFeatures` HOC automatically evaluates visibility rules from `vxconfig`.

**Supports two formats:**

FSE/Voxel style (from WordPress blocks):
```json
{
    "visibilityBehavior": "show",
    "visibilityRules": [
        { "filterKey": "user:logged_in", "operator": "equals", "value": "" },
        { "filterKey": "user:role", "operator": "equals", "value": "subscriber" }
    ]
}
```

Next.js style (alternative):
```json
{
    "visibilityBehavior": "show",
    "visibilityRules": [
        { "type": "user:logged_in" },
        { "type": "user:role", "args": { "value": "subscriber" } }
    ]
}
```

Both formats are automatically normalized and work interchangeably.

**Supported rule types (34 total):**

| Category | Rules |
|----------|-------|
| User | `user:logged_in`, `user:logged_out`, `user:role`, `user:verified`, `user:plan`, `user:can_create_post`, `user:owns_post`, `user:bookmarked_post`, `user:following_author`, `user:followed_by_author` |
| Author | `author:verified`, `author:rating` |
| Post | `post:status`, `post:type`, `post:has_reviews`, `post:is_claimed`, `post:has_claims`, `post:field_is_set`, `post:is_boosted`, `post:product_enabled`, `post:has_orders` |
| DateTime | `datetime:day`, `datetime:time`, `datetime:date` |
| Other | `site:page_is`, `request:param`, `dtag:equals` |

### Loop Element

The HOC also handles loop iteration:

```json
{
    "loopEnabled": true,
    "loopSource": "@post.related_posts",
    "loopLimit": 4,
    "loopOffset": 0
}
```

The block renders once per loop item, with context available via hooks:

- `useLoopItem()` - Full loop item with metadata
- `useLoopValue(path)` - Get specific value from loop item
- `useIsInLoop()` - Check if inside a loop
- `useLoopMeta()` - Get index, total, isFirst, isLast

---

## Manual Usage (Without HOC)

For fine-grained control:

```tsx
import { evaluateVisibility, resolveLoop, useBlockContext } from '@/lib/blocks';

function CustomBlock({ config }) {
    const context = useBlockContext();

    // Manual visibility check
    const shouldShow = evaluateVisibility(config, context);
    if (!shouldShow) return null;

    // Manual loop iteration
    const items = resolveLoop(config, context);

    return (
        <div>
            {items.map((item) => (
                <div key={item.index}>{item.data?.title}</div>
            ))}
        </div>
    );
}
```

---

## Related Documentation

- [Block Config Schema](../block-config-schema.md) - Full JSON schema reference
- [Option C+ Strategy](../01-accelerated-option-c-plus-strategy.md) - Architecture overview
