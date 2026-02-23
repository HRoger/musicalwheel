# Third-Party Blocks BlockDispatcher Compatibility Guide

**Date:** January 2027
**Purpose:** Evaluate Nectar Blocks compatibility with headless Next.js BlockDispatcher
**Architecture:** Option C+ (API-Driven Headless)

---

## Executive Summary

**YES - Nectar Blocks works with your BlockDispatcher, but with limitations.**

They render as HTML fallbacks (TYPE B) rather than structured React components (TYPE A), which is acceptable for layout and design blocks.

---

## Can Nectar Blocks Work with Your BlockDispatcher?

### Short Answer: YES ✅

The plugin is compatible with your headless Next.js BlockDispatcher using the HTML fallback pattern.

### The Two Types of Block Rendering in Headless

| Type | Example | What You Get | How to Render |
|------|---------|--------------|---------------|
| **TYPE A: Custom Blocks** | `voxel-fse/*` | Structured JSON attributes | Your own React component |
| **TYPE B: Third-Party Blocks** | `nectar-blocks/*` | Rendered HTML string | `dangerouslySetInnerHTML` |

---

## How It Works

### Your BlockDispatcher Strategy (Correct!) ✅

Your BlockDispatcher code is **exactly right** for handling both types:

```tsx
// TYPE A: Voxel Blocks - You get attributes, you render React
if (block.name === 'voxel-fse/search-form') {
   return <VoxelSearchForm key={index} {...block.attributes} />
}

// TYPE B: Nectar Blocks - You get HTML, just render it
if (block.name.startsWith('nectar-blocks/')) {
    return (
      <div
        key={index}
        className={`headless-third-party-block ${block.name}`}
        dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
      />
    );
}
```

### What WPGraphQL Content Blocks Returns

When you query `editorBlocks`, you get:

```graphql
{
  editorBlocks {
    name            # "nectar-blocks/tabs"
    renderedHtml    # "<div class='nectar-tabs'>...</div>" ← The HTML output
    attributes {    # Limited structured data (may be empty for some blocks)
      name
      value
    }
  }
}
```

**Key Insight:** Third-party blocks that use `render_callback` or `render.php` will have their HTML in `renderedHtml`. You just display it.

---

## Implementation Guide

### 1. CSS: Copy Their Styles

Copy the compiled CSS files from each plugin to your Next.js project:

**File Locations:**
- **Nectar Blocks:** `wp-content/plugins/nectar-blocks/build/frontend-styles.css`

**Next.js Integration:**

```tsx
// app/layout.tsx (Next.js)
import '@/styles/third-party/nectar-blocks.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### 2. JS: Load Their Frontend Scripts (for interactivity)

Many blocks require JavaScript for interactivity (tabs, accordions, animations).

**File Locations:**
- **Nectar Blocks:** `wp-content/plugins/nectar-blocks/build/blocks/*/frontend-script.js`

**Next.js Integration:**

```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
         {children}
         {/* Nectar tabs, accordions, animations */}
         <Script src="/js/nectar-frontend.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
```

### 3. Updated BlockDispatcher

Complete implementation with all block types:

```tsx
// apps/frontend/components/BlockDispatcher.tsx

export function BlockDispatcher({ blocks }) {
  if (!blocks) return null;

  return blocks.map((block, index) => {

    // ----------------------------------------------------
    // TYPE A: Voxel FSE Blocks (Full React Components)
    // You rebuilt these - full control over rendering
    // ----------------------------------------------------
    if (block.name === 'voxel-fse/search-form') {
       return <VoxelSearchForm key={index} {...block.attributes} />
    }
    if (block.name === 'voxel-fse/post-feed') {
       return <VoxelPostFeed key={index} {...block.attributes} />
    }
    if (block.name === 'voxel-fse/create-post') {
       return <VoxelCreatePost key={index} {...block.attributes} />
    }
    if (block.name === 'voxel-fse/map') {
       return <VoxelMap key={index} {...block.attributes} />
    }
    if (block.name === 'voxel-fse/popup-kit') {
       return <VoxelPopupKit key={index} {...block.attributes} />
    }

    // ----------------------------------------------------
    // TYPE B: Nectar Blocks (HTML Fallback)
    // You DON'T have the source, just render their HTML
    // ----------------------------------------------------
    if (block.name.startsWith('nectar-blocks/')) {
        return (
          <div
            key={index}
            className="headless-nectar-block"
            data-block-name={block.name}
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
    }

    // ----------------------------------------------------
    // TYPE C: Core WordPress Blocks (HTML Fallback)
    // Paragraphs, Headings, Images, etc.
    // ----------------------------------------------------
    if (block.name.startsWith('core/')) {
        return (
          <div
            key={index}
            className="headless-core-block"
            data-block-name={block.name}
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
    }

    // ----------------------------------------------------
    // Fallback: Unknown blocks
    // ----------------------------------------------------
    console.warn(`Unknown block type: ${block.name}`);
    return null;
  });
}
```

---

## Compatibility Matrix

| Plugin | Works in WordPress Editor? | Works in Next.js Headless? | How? | Limitations |
|--------|---------------------------|---------------------------|------|-------------|
| **Nectar Blocks** | ✅ Yes | ✅ Yes | HTML fallback + their CSS/JS | No attribute access |
| **Voxel FSE** | ✅ Yes | ✅ Yes | Structured attributes + your React | Full control |
| **Core Blocks** | ✅ Yes | ✅ Yes | HTML fallback | Standard WP blocks |

---

## Important Limitations

### What You CAN Do:

- ✅ Use Nectar Tabs, Flex-Box, Buttons in your headless site
- ✅ Mix them with your Voxel FSE blocks on the same page
- ✅ Style them (their CSS classes are preserved in the HTML)
- ✅ Interactive features work (if you load their JS files)

### What You CANNOT Do:

- ❌ Access individual attributes of Nectar blocks programmatically in Next.js
- ❌ Conditionally render based on their internal settings in React
- ❌ Override their rendering logic (it's baked into the HTML)
- ❌ Server-side render their dynamic content (they're pre-rendered by WordPress)

### Example: Tabs Limitation

```tsx
// ❌ This is NOT possible for Nectar Tabs:
if (block.name === 'nectar-blocks/tabs') {
   // You can't do this - attributes aren't exposed
   return <MyCustomTabs tabs={block.attributes.tabs} />
}

// ✅ This IS possible:
if (block.name === 'nectar-blocks/tabs') {
   // Just render their HTML - it includes all the tab markup
   return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />
}
```

---

## Verdict: Should You Use Them?

### ✅ YES - Use them for:

**Layout Blocks:**
- Nectar Flex-Box
- Nectar Row/Container

**UI Components:**
- Buttons
- Accordions
- Tabs
- Cards
- Progress bars

**Typography:**
- Headings
- Text blocks
- Styled paragraphs

**Decorative Elements:**
- Dividers
- Spacers
- Icons

### ❌ NO - Don't use them for:

**Voxel-Specific Features:**
- Search forms (use `voxel-fse/search-form`)
- Post feeds (use `voxel-fse/post-feed`)
- Create post forms (use `voxel-fse/create-post`)
- Maps with Voxel data (use `voxel-fse/map`)

**Complex Interactive Features:**
- Features requiring Voxel API integration
- Dynamic content that changes based on Voxel data
- Real-time features (use Supabase + custom React)

**Blocks Needing Attribute Access:**
- Situations where you need programmatic control over block settings
- Conditional rendering based on block configuration

---

## Performance Considerations

### Bundle Size

**Nectar Blocks:**
- CSS: ~150KB (minified)
- JS: ~80KB (minified)

**Recommendation:** Load these scripts with `strategy="lazyOnload"` in Next.js `<Script>` component to avoid blocking page render.

### HTML Size

Third-party blocks render as HTML strings, which can be larger than structured JSON. However:
- ✅ HTML is highly compressible (gzip/brotli)
- ✅ Cached by CDN after first load
- ✅ Faster than rebuilding complex layouts in React

### Interactivity

**Client-Side Only:**
- Tabs, accordions, etc. only work after JavaScript loads
- Initial page load shows static HTML
- Progressive enhancement pattern

---

## Testing Checklist

### WordPress Editor Test

- [ ] Install Nectar Blocks plugin
- [ ] Create test page with mix of blocks:
  - [ ] Voxel FSE Search Form
  - [ ] Nectar Tabs
  - [ ] Core Paragraph
- [ ] Verify all blocks render correctly in editor
- [ ] Save page and preview in WordPress

### WPGraphQL Test

```graphql
query TestBlocksQuery {
  page(id: "test-page", idType: URI) {
    editorBlocks {
      name
      renderedHtml
      attributes {
        name
        value
      }
    }
  }
}
```

**Check:**
- [ ] `renderedHtml` contains full HTML for Nectar blocks
- [ ] Voxel FSE blocks have structured `attributes`
- [ ] All blocks are present in response

### Next.js Frontend Test

- [ ] Copy CSS files to Next.js `/styles/third-party/`
- [ ] Copy JS files to Next.js `/public/js/`
- [ ] Import CSS in `layout.tsx`
- [ ] Load JS with `<Script>` component
- [ ] Verify `BlockDispatcher` renders all block types
- [ ] Test interactivity (click tabs, accordions)
- [ ] Check responsive behavior
- [ ] Test in multiple browsers

---

## Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  WordPress Editor (Block Composer)                             │
│  ├── Voxel FSE Blocks (your custom blocks)                     │
│  │   ├── Search Form                                           │
│  │   ├── Post Feed                                             │
│  │   ├── Create Post                                           │
│  │   └── Map                                                   │
│  ├── Nectar Blocks (layout, design)                            │
│  │   ├── Flex-Box                                              │
│  │   ├── Tabs                                                  │
│  │   └── Button                                                │
│  └── Core Blocks (text, images)                                │
│      ├── Paragraph                                             │
│      ├── Heading                                               │
│      └── Image                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (WPGraphQL editorBlocks query)
┌─────────────────────────────────────────────────────────────────┐
│  GraphQL API Response                                           │
│  {                                                              │
│    editorBlocks: [                                              │
│      { name: "voxel-fse/search-form", attributes: {...} },     │
│      { name: "nectar-blocks/tabs", renderedHtml: "..." },      │
│      { name: "core/paragraph", renderedHtml: "..." }           │
│    ]                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (BlockDispatcher routing)
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Frontend (Headless)                                    │
│  ├── TYPE A: voxel-fse/* → React Components (attributes)       │
│  │   └── <VoxelSearchForm {...attributes} />                   │
│  ├── TYPE B: nectar-blocks/* → HTML Fallback (renderedHtml)    │
│  │   └── <div dangerouslySetInnerHTML={{__html: html}} />      │
│  └── TYPE C: core/* → HTML Fallback (renderedHtml)             │
│      └── <div dangerouslySetInnerHTML={{__html: html}} />      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Browser render)
┌─────────────────────────────────────────────────────────────────┐
│  Customer sees fully functional page:                           │
│  ✅ Voxel search works (React component)                        │
│  ✅ Nectar tabs are clickable (their JS hydrates HTML)          │
│  ✅ Core blocks display correctly (standard HTML)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

**Your BlockDispatcher approach is architecturally sound.**

You can absolutely use Nectar Blocks alongside your Voxel FSE blocks in your headless Next.js frontend. The key is understanding the distinction:

**Voxel FSE Blocks (TYPE A):**
- You rebuilt these with full React components
- You have structured attributes via GraphQL
- Full programmatic control in Next.js

**Nectar Blocks (TYPE B):**
- Treat as "HTML Black Boxes"
- Render using `dangerouslySetInnerHTML`
- Load their CSS/JS files for styling and interactivity

This hybrid approach gives you the best of both worlds:
- **Control** where you need it (Voxel data-driven blocks)
- **Speed** where you don't (pre-built UI components)

The 80/20 rule applies: Use third-party blocks for 80% of your layout/design needs, reserve custom React components for the 20% that needs Voxel integration.

---

**Document Version:** 1.0.0
**Last Updated:** January 2027
**Related Docs:**
- `01-accelerated-option-c-plus-strategy.md`
- `11-wordpress-preview-vs-headless-architecture.md`
- `docs/essential addons/headless-plugin-compatibility-analysis.md`
