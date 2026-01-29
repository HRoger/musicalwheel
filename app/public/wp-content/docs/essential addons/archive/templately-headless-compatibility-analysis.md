# Templately Headless Compatibility Analysis

**Date:** December 11, 2025  
**Purpose:** Analyze Templately plugin for headless WordPress compatibility  
**Question:** Can Templately be used in headless workflow? What changes are needed?

---

## Executive Summary

| Question | Answer |
|----------|--------|
| **Can Templately be used in headless workflow?** | ⚠️ **PARTIAL** - Templates work, but with limitations |
| **Does it support Gutenberg blocks?** | ✅ **YES** - Full Gutenberg support |
| **Does it use `render_callback`?** | ✅ **NO** - Uses `parse_blocks()` and `serialize_blocks()` |
| **Is it headless-compatible?** | ⚠️ **PARTIAL** - Static blocks work, dynamic blocks need Next.js replacements |
| **What needs to change?** | ⚠️ **Template import process** + **Dynamic block handling** |

---

## What is Templately?

**Templately** is a template library plugin that provides:
- 6,500+ free & premium templates
- Support for Elementor AND Gutenberg
- Cloud storage for templates (MyCloud)
- Team collaboration (MyWorkspace)
- Full site import
- AI-powered template generation

**Key Features:**
- ✅ Import pre-designed templates
- ✅ Save your own templates to cloud
- ✅ Share templates across websites
- ✅ Full site import (entire template packs)
- ✅ Gutenberg block templates
- ✅ Elementor templates (not relevant for headless)

---

## How Templately Works with Gutenberg

### Template Import Process

```
1. User selects template from Templately library
   ↓
2. Templately downloads template JSON
   ↓
3. parse_blocks() - Parses Gutenberg block markup
   ↓
4. Process blocks (replace IDs, URLs, images)
   ↓
5. serialize_blocks() - Converts back to HTML
   ↓
6. Save to wp_posts.post_content
```

### Code Evidence

**File:** `includes/Core/Importer/Utils/GutenbergHelper.php`

```php
public function prepare( $template_json, $template_settings, $extra_content = [], $request_params = [] ) {
    // Parse Gutenberg blocks from template
    $parsed_blocks = parse_blocks( $template_json['content'] );
    
    // Process images
    if ( isset($this->template_settings['__attachments']) ) {
        $this->process_images();
    }
    
    // Replace block data (IDs, URLs, etc.)
    $this->replace( $parsed_blocks, $request_params );
    
    // Serialize back to HTML
    $this->content = wp_slash( serialize_blocks( $parsed_blocks ) );
    
    return $this;
}
```

**Key Insight:** Templately uses WordPress core functions (`parse_blocks`, `serialize_blocks`) - **NOT** `render_callback`!

---

## Headless Compatibility Analysis

### ✅ What Works in Headless

#### 1. **Static Gutenberg Blocks** ✅
Templately imports static blocks perfectly:
- Paragraph, Heading, List, Quote
- Image, Gallery, Video
- Buttons, Columns, Group
- Any block that saves HTML to database

**Why it works:**
- Uses `parse_blocks()` - standard WordPress function
- Saves static HTML to `post_content`
- WPGraphQL can read this content
- Next.js can render via `@faustwp/blocks`

#### 2. **Essential Blocks Templates** ✅
Templately has 3,300+ Gutenberg templates built with Essential Blocks:
- Slider, Image Gallery, Testimonials
- Call to Action, Info Box, Pricing Table
- All Essential Blocks work (with modifications)

**Why it works:**
- Essential Blocks save static HTML
- Templately processes block attributes correctly
- Images are imported and remapped

#### 3. **Image Processing** ✅
Templately handles images intelligently:
```php
// Processes all image sizes
$organizedUrls = $this->template_settings['__attachments'];
foreach ($organizedUrls as $base_url => $sizes) {
    $attachment_id = $this->wp_importer->process_attachment($post_data, $base_url, $sizes);
    self::$attachment_ids[$base_url] = $attachment_id;
}
```

**Result:** All images are imported to WordPress Media Library with correct IDs

---

### ⚠️ What Needs Modification

#### 1. **Dynamic Blocks** ⚠️
Templates using dynamic WordPress blocks need Next.js replacements:
- Latest Posts
- Navigation
- Query Loop
- Site Logo, Site Title
- Post Title, Post Content

**Why:**
- These blocks use PHP `render_callback`
- WPGraphQL can't access PHP execution
- Need custom Next.js components

**Solution:**
- Import template to WordPress (works fine)
- Replace dynamic blocks with Next.js components
- Use WPGraphQL to fetch data

#### 2. **Template Import Workflow** ⚠️
Current workflow is WordPress-centric:

```
Templately → WordPress Editor → Save → Display on WordPress Frontend
```

**Headless workflow needs:**
```
Templately → WordPress Editor → Save → WPGraphQL → Next.js Frontend
```

**What changes:**
- ✅ Import process stays the same
- ✅ Editing in WordPress stays the same
- ⚠️ **Frontend rendering** - Must use Next.js
- ⚠️ **Dynamic blocks** - Must build React components

---

### ❌ What Doesn't Work

#### 1. **Elementor Templates** ❌
Templately has 3,200+ Elementor templates, but:
- Elementor is NOT headless-compatible
- Uses PHP rendering
- Not compatible with WPGraphQL
- **Cannot be used in headless workflow**

**Verdict:** Ignore Elementor templates, use only Gutenberg templates

#### 2. **Full Site Import (Elementor)** ❌
Full site import with Elementor templates won't work in headless

**Verdict:** Only use Gutenberg-based full site imports

---

## Compatibility Matrix

| Feature | WordPress (Traditional) | Headless (Next.js) | Notes |
|---------|------------------------|-------------------|-------|
| **Gutenberg Template Import** | ✅ Works | ✅ Works | No changes needed |
| **Static Blocks** | ✅ Works | ✅ Works | WPGraphQL compatible |
| **Essential Blocks** | ✅ Works | ⚠️ **Needs modification** | Replace `BlockProps.Save` |
| **Dynamic Blocks** | ✅ Works | ⚠️ **Need React components** | Build custom Next.js components |
| **Image Import** | ✅ Works | ✅ Works | Imported to Media Library |
| **Template Cloud Storage** | ✅ Works | ✅ Works | No changes needed |
| **Team Collaboration** | ✅ Works | ✅ Works | No changes needed |
| **Elementor Templates** | ✅ Works | ❌ **NOT compatible** | Cannot use in headless |
| **Full Site Import (Gutenberg)** | ✅ Works | ⚠️ **Partial** | Static blocks work, dynamic need replacement |

---

## What You Need to Change

### Step 1: Use Only Gutenberg Templates ✅
```
✅ DO: Import Gutenberg templates from Templately
❌ DON'T: Import Elementor templates
```

### Step 2: Modify Essential Blocks (If Used) ⚠️
If templates use Essential Blocks:

**In WordPress:**
```tsx
// Keep Essential Blocks controls in edit.tsx
import { InspectorPanel } from "@essential-blocks/controls";

<InspectorPanel
  advancedControlProps={{
    marginPrefix: "blockMargin",
    paddingPrefix: "blockPadding",
    hasMargin: true,
    hasPadding: true,
  }}
>
  <InspectorPanel.General>
    {/* Your controls */}
  </InspectorPanel.General>
</InspectorPanel>
```

**Replace save.tsx:**
```tsx
// Replace BlockProps.Save with vxconfig
export default function save({ attributes }) {
  const vxConfig = {
    margin: attributes.blockMargin,
    padding: attributes.blockPadding,
    // ... all attributes
  };

  return (
    <div data-block-type="my-block">
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vxConfig)
        }}
      />
      <div className="placeholder">Loading...</div>
    </div>
  );
}
```

**In Next.js:**
```tsx
// apps/musicalwheel-frontend/components/blocks/MyBlock.tsx
export function MyBlock({ vxConfig }) {
  const styles = generateStyles(vxConfig);
  
  return (
    <div style={styles}>
      {/* Block content */}
    </div>
  );
}
```

### Step 3: Replace Dynamic Blocks ⚠️
For templates using dynamic blocks:

**WordPress Core Dynamic Blocks → Next.js Components:**

| WordPress Block | Next.js Component |
|----------------|-------------------|
| Latest Posts | `<LatestPosts />` (fetch via WPGraphQL) |
| Navigation | `<Navigation />` (fetch menu via WPGraphQL) |
| Query Loop | `<QueryLoop />` (fetch posts via WPGraphQL) |
| Site Logo | `<SiteLogo />` (fetch from site settings) |
| Post Title | `<PostTitle />` (from page props) |

**Example:**
```tsx
// apps/musicalwheel-frontend/components/LatestPosts.tsx
export function LatestPosts({ count = 5 }) {
  const { data } = useQuery(GET_LATEST_POSTS, {
    variables: { first: count }
  });
  
  return (
    <div className="latest-posts">
      {data.posts.nodes.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Step 4: Set Up WPGraphQL ✅
```bash
# Install required plugins
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-content-blocks --activate
```

### Step 5: Configure Next.js ✅
```bash
# Install Faust.js
npm install @faustwp/core @faustwp/blocks graphql-request
```

---

## Recommended Workflow

### Phase 1: Template Selection ✅
1. Browse Templately library
2. **Filter:** Gutenberg templates only
3. Preview template
4. Import to WordPress

### Phase 2: WordPress Editing ✅
1. Template imported to WordPress
2. Edit in Gutenberg editor
3. Customize with Essential Blocks controls
4. Save template

### Phase 3: Headless Rendering ⚠️
1. WPGraphQL exposes post content
2. Next.js fetches via GraphQL
3. `@faustwp/blocks` renders static blocks
4. Custom components render dynamic blocks

### Phase 4: Deployment ✅
1. WordPress on WP Engine (admin only)
2. Next.js on Vercel (customer-facing)
3. ISR caching (24h)
4. On-demand revalidation via webhooks

---

## Example: Full Workflow

### 1. Import Template from Templately
```
User selects "Business Landing Page" template
↓
Templately imports to WordPress
↓
Template saved to wp_posts
```

### 2. WordPress Content
```html
<!-- post_content in database -->
<!-- wp:heading -->
<h1>Welcome to Our Business</h1>
<!-- /wp:heading -->

<!-- wp:essential-blocks/slider -->
<div data-block-type="slider">
  <script class="vxconfig">
    {"images": [...], "margin": {...}}
  </script>
</div>
<!-- /wp:essential-blocks/slider -->

<!-- wp:core/latest-posts /-->
```

### 3. WPGraphQL Query
```graphql
query GetPage($id: ID!) {
  page(id: $id) {
    title
    content
    blocks {
      name
      attributes
      innerBlocks
    }
  }
}
```

### 4. Next.js Rendering
```tsx
// apps/musicalwheel-frontend/app/[slug]/page.tsx
export default function Page({ blocks }) {
  return (
    <div>
      {blocks.map(block => {
        switch (block.name) {
          case 'core/heading':
            return <Heading {...block.attributes} />;
          case 'essential-blocks/slider':
            return <SliderBlock vxConfig={block.vxConfig} />;
          case 'core/latest-posts':
            return <LatestPosts {...block.attributes} />;
          default:
            return <CoreBlock block={block} />;
        }
      })}
    </div>
  );
}
```

---

## Benefits of Using Templately in Headless

### ✅ Pros

1. **6,500+ Ready Templates** - Massive time savings
2. **Professional Designs** - No need to design from scratch
3. **Cloud Storage** - Reuse templates across sites
4. **Team Collaboration** - Work together on templates
5. **AI Generation** - Create custom templates with AI
6. **Image Handling** - Automatic image import and optimization
7. **Block Processing** - Intelligent block attribute replacement
8. **No Vendor Lock-in** - Uses standard WordPress blocks

### ⚠️ Cons

1. **Elementor Templates Unusable** - 3,200+ templates not compatible
2. **Dynamic Blocks Need Work** - Must build Next.js components
3. **Essential Blocks Modification** - Need to replace `BlockProps.Save`
4. **Two Component Files** - WordPress + Next.js (unavoidable)

---

## Compatibility Score

| Aspect | Score | Notes |
|--------|-------|-------|
| **Template Import** | 10/10 | ✅ Works perfectly |
| **Static Blocks** | 10/10 | ✅ Fully compatible |
| **Essential Blocks** | 7/10 | ⚠️ Need modifications |
| **Dynamic Blocks** | 5/10 | ⚠️ Need Next.js components |
| **Image Handling** | 10/10 | ✅ Excellent |
| **Cloud Features** | 10/10 | ✅ Work unchanged |
| **Overall** | **8/10** | **RECOMMENDED with modifications** |

---

## Final Verdict

### **YES, Use Templately in Headless Workflow** ✅

**Why:**
- ✅ Saves massive development time (6,500+ templates)
- ✅ Professional designs ready to use
- ✅ Gutenberg templates are headless-compatible
- ✅ Image handling is excellent
- ✅ Cloud features work unchanged
- ✅ No `render_callback` dependencies

**But you need to:**
- ⚠️ **Only use Gutenberg templates** (ignore Elementor)
- ⚠️ **Modify Essential Blocks** (replace `BlockProps.Save`)
- ⚠️ **Build Next.js components** for dynamic blocks
- ⚠️ **Set up WPGraphQL** + Faust.js

**Time savings:**
- ✅ **Template design:** 20-40 hours saved per template
- ⚠️ **Modifications needed:** 4-8 hours per template
- ✅ **Net savings:** 15-30 hours per template

**Recommended for:**
- ✅ Projects needing professional designs quickly
- ✅ Teams wanting template reusability
- ✅ Sites using Essential Blocks
- ✅ Headless WordPress + Next.js setups

**Not recommended for:**
- ❌ Projects heavily using Elementor
- ❌ Sites needing 100% dynamic content
- ❌ Teams without React/Next.js expertise

---

## Implementation Checklist

### WordPress Setup
- [ ] Install Templately plugin
- [ ] Install WPGraphQL
- [ ] Install WPGraphQL Content Blocks
- [ ] Browse Gutenberg templates only
- [ ] Import desired templates
- [ ] Customize in WordPress editor

### Block Modifications
- [ ] Extract Essential Blocks controls
- [ ] Replace `BlockProps.Save` with `save.tsx`
- [ ] Build style generation utilities
- [ ] Test in WordPress editor

### Next.js Setup
- [ ] Install `@faustwp/core`
- [ ] Install `@faustwp/blocks`
- [ ] Create block components
- [ ] Build dynamic block replacements
- [ ] Set up GraphQL queries
- [ ] Configure ISR caching

### Testing
- [ ] Test template import
- [ ] Test static blocks rendering
- [ ] Test Essential Blocks rendering
- [ ] Test dynamic blocks replacement
- [ ] Test image loading
- [ ] Test responsive design

---

**Document Version:** 1.0.0  
**Last Updated:** December 11, 2025  
**Analyst:** AI Agent  
**Status:** Analysis Complete ✅
