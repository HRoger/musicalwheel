# Stackable Headless Conversion Analysis

**Date:** December 2025  
**Purpose:** Evaluate converting Stackable WordPress plugin blocks to headless-ready architecture  
**Reference:** Based on `voxel-widget-conversion-master-guide.md` Plan C+ pattern

---

## Executive Summary

**Verdict:** ✅ **Worthwhile but requires independent library approach**

Converting Stackable blocks to headless-ready architecture is **technically feasible** and **strategically valuable**, but requires creating an **independent component library** rather than a child plugin. This document outlines the approach, requirements, and recommendations.

---

## Current Stackable Architecture Analysis

### How Stackable Works Today

**Evidence from codebase:**
- **50+ blocks** (accordion, button, card, columns, posts, tabs, etc.)
- **No `render.php` files** - Blocks use JavaScript `save.js` that returns `null`
- **Server-side rendering** - Blocks rely on `render_callback` or dynamic PHP rendering
- **GPL Licensed** - Code can be modified and redistributed
- **Premium features** - Require license key (subject to terms)

**Block Structure:**
```
stackable-ultimate-gutenberg-blocks-premium/
├── src/block/
│   ├── button/
│   │   ├── block.json          # Block metadata
│   │   └── index.php           # Placeholder (no render logic)
│   ├── posts/
│   │   ├── block.json
│   │   └── index.php
│   └── ... (50+ blocks)
└── dist/
    ├── editor_blocks.css       # Editor styles
    ├── editor_blocks.js        # Editor scripts
    └── frontend.min.css         # Frontend styles
```

**Rendering Method:**
- Blocks use JavaScript `save.js` that returns `null`
- WordPress calls `render_callback` for frontend rendering
- PHP generates HTML at runtime
- **NOT headless compatible** - Next.js cannot execute PHP

---

## Why Stackable Blocks Are NOT Headless Compatible

### The Problem

```php
// Stackable's approach (incompatible with headless)
register_block_type('stackable/button', [
    'render_callback' => function($attributes, $content) {
        // PHP executes at render time
        return '<div class="stk-button">...</div>';
    }
]);
```

**Why this breaks headless:**
1. **WPGraphQL cannot execute PHP** - GraphQL queries return block attributes only
2. **Next.js receives empty blocks** - No rendered HTML in GraphQL response
3. **No React components** - Stackable has no frontend React library
4. **Tight WordPress coupling** - Blocks depend on WordPress PHP functions

### Evidence from Documentation

From `docs/headless-architecture/02-headless-architecture-options-summary.md`:

> **Finding: NONE Are Headless Compatible**
> 
> **Reason:** All three plugins use `render_callback` for server-side PHP rendering:
> - Stackable blocks use `save.js` that returns `null` (server-side only)
> - GenerateBlocks uses `render_callback`
> - Kadence Blocks uses `render_callback`

---

## Conversion Strategy: Independent Library Approach

### Why NOT a Child Plugin?

**Child Plugin Limitations:**
1. **Dependency on Stackable** - Still requires Stackable plugin to be installed
2. **License conflicts** - Premium features tied to Stackable license
3. **Update conflicts** - Stackable updates may break child plugin
4. **Namespace conflicts** - Risk of class/function name collisions
5. **Limited control** - Cannot fully customize without modifying parent

**Independent Library Benefits:**
1. ✅ **Zero dependencies** - Works standalone
2. ✅ **Full control** - Complete customization freedom
3. ✅ **Clean architecture** - No legacy code constraints
4. ✅ **Headless-first** - Built for Next.js from ground up
5. ✅ **License freedom** - No Stackable license restrictions

### Recommended Approach: Create "Stackable-FSE" Component Library

**Name:** `stackable-fse` (or `headless-stackable`)  
**Purpose:** Headless-ready component library inspired by Stackable's design

---

## Conversion Requirements

### 1. Architecture Pattern: Plan C+ (Mandatory)

Following `voxel-widget-conversion-master-guide.md` Section 2:

**Key Requirements:**
- ✅ **NO `render.php`** - Zero PHP rendering
- ✅ **NO `render_callback`** - No server-side callbacks
- ✅ **NO `ServerSideRender`** - No WordPress dependency
- ✅ **vxconfig JSON** - Minimal attributes stored in database
- ✅ **REST API** - Fetch configuration at runtime
- ✅ **React hydration** - Static HTML → React mount
- ✅ **Shared components** - Same React component in editor + frontend

### 2. File Structure per Block

```
stackable-fse/
├── blocks/
│   ├── button/
│   │   ├── block.json              # NO "render" property
│   │   ├── index.tsx               # Editor registration
│   │   ├── edit.tsx                # Editor component
│   │   ├── save.tsx                # Outputs vxconfig + placeholder
│   │   ├── frontend.tsx            # React hydration
│   │   ├── shared/
│   │   │   └── ButtonComponent.tsx # Shared React component
│   │   ├── hooks/
│   │   │   └── useButtonConfig.ts # REST API hook
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── editor.css              # Editor-only styles
│   ├── card/
│   │   └── ... (same structure)
│   └── ... (all 50+ blocks)
├── shared/
│   ├── controls/                   # Reusable controls
│   ├── components/                 # Shared UI components
│   └── utils/                      # Utility functions
└── package.json
```

### 3. Block Conversion Checklist (Per Block)

For EACH Stackable block, you must:

- [ ] **Analyze original block**
  - [ ] Read Stackable's block.json
  - [ ] Inspect rendered HTML output
  - [ ] Document all CSS classes used
  - [ ] List all Elementor/Stackable controls
  - [ ] Identify JavaScript dependencies

- [ ] **Create Plan C+ structure**
  - [ ] Create block directory with subdirectories
  - [ ] Create block.json (NO "render" property)
  - [ ] Define TypeScript interfaces
  - [ ] Create index.tsx entry point

- [ ] **Implement Inspector Controls**
  - [ ] Map Stackable controls to Gutenberg
  - [ ] Use shared controls where possible
  - [ ] Organize into PanelBody sections
  - [ ] Handle responsive controls

- [ ] **Create shared component**
  - [ ] Build React component matching Stackable HTML
  - [ ] Use exact same CSS classes
  - [ ] Support both editor and frontend contexts
  - [ ] Re-render vxconfig in component

- [ ] **Implement save.tsx**
  - [ ] Output vxconfig JSON in script tag
  - [ ] Output placeholder HTML
  - [ ] Include all attributes needed by frontend

- [ ] **Implement frontend.tsx**
  - [ ] Parse vxconfig from script tag
  - [ ] Fetch REST API config (if needed)
  - [ ] Mount React using createRoot
  - [ ] Handle Turbo/PJAX navigation

- [ ] **Create REST API endpoint** (if dynamic data needed)
  - [ ] Register endpoint in PHP controller
  - [ ] Implement permission callback
  - [ ] Return JSON configuration

- [ ] **Build configuration**
  - [ ] Editor build (ES modules)
  - [ ] Frontend build (IIFE)
  - [ ] Update package.json scripts

### 4. CSS Strategy: Inherit from Stackable (If Possible)

**Option A: CSS Inheritance (Recommended)**
- Use Stackable's CSS classes exactly
- Match HTML structure 1:1
- Zero custom CSS needed
- Works if Stackable CSS is enqueued

**Option B: Extract CSS (If Stackable Not Available)**
- Extract relevant CSS from Stackable's `frontend.min.css`
- Create `stackable-fse/assets/css/` directory
- Include only used styles
- Maintain class name compatibility

**Option C: Rebuild CSS (If License Issues)**
- Recreate styles from scratch
- Match Stackable's visual design
- Use same class names for compatibility
- Document any differences

---

## Conversion Effort Estimate

### Per-Block Time Estimate

| Task | Time | Notes |
|------|------|-------|
| **Discovery** | 1-2 hours | Analyze original block, HTML, controls |
| **Block scaffolding** | 30 min | Create structure, block.json, types |
| **Inspector controls** | 2-4 hours | Map controls, implement UI |
| **Shared component** | 4-8 hours | Build React component, match HTML |
| **save.tsx** | 30 min | Output vxconfig + placeholder |
| **frontend.tsx** | 1-2 hours | Parse vxconfig, mount React |
| **REST API** | 1-2 hours | If dynamic data needed |
| **Testing** | 2-4 hours | Editor + frontend testing |
| **Total per block** | **12-24 hours** | Simple blocks: 12h, Complex: 24h |

### Total Project Estimate

**50+ Stackable blocks to convert:**

- **Simple blocks** (30 blocks): 12 hours × 30 = **360 hours**
- **Complex blocks** (20 blocks): 24 hours × 20 = **480 hours**
- **Infrastructure** (shared controls, build system): **80 hours**
- **Testing & documentation**: **80 hours**

**Total: ~1,000 hours (25 weeks @ 40 hours/week)**

**Realistic timeline:** 6-8 months with 1-2 developers

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goals:**
- Set up project structure
- Create shared controls library
- Build build system (Vite)
- Convert 2-3 simple blocks as proof of concept

**Deliverables:**
- Project scaffolding
- Build system working
- 2-3 converted blocks (button, heading, text)
- Documentation template

### Phase 2: Core Blocks (Weeks 3-6)

**Goals:**
- Convert most-used blocks
- Establish conversion patterns
- Create component library

**Priority Blocks:**
1. Button / Button Group
2. Heading / Subtitle
3. Text / Blockquote
4. Card / Feature
5. Columns / Column
6. Image / Image Box
7. Icon / Icon Box
8. Spacer / Divider

**Deliverables:**
- 15-20 core blocks converted
- Shared component patterns established
- Conversion workflow documented

### Phase 3: Advanced Blocks (Weeks 7-10)

**Goals:**
- Convert complex blocks
- Implement dynamic features
- Add REST API endpoints

**Complex Blocks:**
1. Posts (needs REST API)
2. Tabs / Accordion
3. Carousel / Horizontal Scroller
4. Timeline
5. Count Up / Countdown
6. Progress Bar / Circle
7. Map (if needed)
8. Video Popup

**Deliverables:**
- 20-25 advanced blocks converted
- REST API endpoints created
- Dynamic data fetching working

### Phase 4: Remaining Blocks (Weeks 11-14)

**Goals:**
- Convert remaining blocks
- Polish and optimize
- Comprehensive testing

**Deliverables:**
- All 50+ blocks converted
- Full test coverage
- Performance optimized

### Phase 5: Documentation & Release (Weeks 15-16)

**Goals:**
- Complete documentation
- Migration guide
- Release preparation

**Deliverables:**
- User documentation
- Developer guide
- Migration tools (if needed)
- Version 1.0 release

---

## Technical Challenges & Solutions

### Challenge 1: Stackable's Advanced Controls

**Problem:** Stackable has custom controls (spacing, typography, colors) that don't exist in WordPress core.

**Solution:**
- Use Stackable's controls in editor (if plugin installed)
- Create fallback custom controls
- Extract Stackable's control logic (if GPL allows)
- Build equivalent controls from scratch

**Implementation:**
```typescript
// Use Stackable if available, fallback to custom
import { useStackable } from '../shared/hooks/useStackable';

function SpacingControl({ value, onChange }) {
  const { isAvailable, FourRangeControl } = useStackable();
  
  if (isAvailable && FourRangeControl) {
    return <FourRangeControl value={value} onChange={onChange} />;
  }
  
  // Fallback to custom control
  return <CustomSpacingControl value={value} onChange={onChange} />;
}
```

### Challenge 2: CSS Class Compatibility

**Problem:** Need to match Stackable's CSS classes exactly for styling compatibility.

**Solution:**
- Document all Stackable CSS classes used
- Use exact same class names in React components
- Extract CSS if Stackable not available
- Test visual parity

**Example:**
```typescript
// Match Stackable's HTML structure exactly
<div className="stk-block stk-button">
  <a className="stk-button stk-button--style-filled">
    <span className="stk-button__text">Click me</span>
  </a>
</div>
```

### Challenge 3: Dynamic Blocks (Posts, Carousel)

**Problem:** Blocks like "Posts" need server-side data fetching.

**Solution:**
- Create REST API endpoints
- Use Plan C+ pattern (API-driven)
- Implement ISR caching in Next.js
- Handle loading states

**Implementation:**
```typescript
// REST API endpoint
register_rest_route('stackable-fse/v1', '/posts', [
    'methods' => 'GET',
    'callback' => 'get_posts_data',
    'permission_callback' => '__return_true',
]);

// React hook
function usePostsConfig(query) {
  return useBlockConfig<PostsConfig>(
    `/stackable-fse/v1/posts?${query}`,
    'posts-config'
  );
}
```

### Challenge 4: Inner Blocks (Tabs, Accordion)

**Problem:** Blocks with inner blocks need special handling.

**Solution:**
- Use WordPress `InnerBlocks` component
- Store inner block content in attributes
- Handle nested structure in React
- Support block templates

**Implementation:**
```typescript
// Editor
<InnerBlocks
  allowedBlocks={['stackable-fse/tab-content']}
  template={[
    ['stackable-fse/tab-content', { label: 'Tab 1' }],
    ['stackable-fse/tab-content', { label: 'Tab 2' }],
  ]}
/>

// Frontend - parse inner blocks from vxconfig
const tabs = vxConfig.innerBlocks || [];
```

---

## Licensing Considerations

### GPL Compliance

**Stackable is GPL-licensed**, which means:
- ✅ You can modify the code
- ✅ You can redistribute modified versions
- ✅ You can create derivative works
- ⚠️ Your derivative must also be GPL-licensed
- ⚠️ Premium features may have additional restrictions

### Recommended Approach

1. **Create independent library** - Not a fork of Stackable
2. **Inspired by, not copied from** - Rebuild components from scratch
3. **Document inspiration** - Credit Stackable as inspiration
4. **Different namespace** - Use `stackable-fse/` not `stackable/`
5. **Own license** - Can choose MIT/Apache if no Stackable code copied

### Legal Recommendation

**Consult with legal counsel** before:
- Extracting CSS from Stackable
- Copying JavaScript logic
- Using Stackable's design assets
- Redistributing any Stackable code

**Safe approach:**
- Rebuild everything from scratch
- Use Stackable as design reference only
- Create original implementations
- No code copying

---

## Alternative: Gradual Migration Strategy

### Hybrid Approach (Recommended for Large Sites)

Instead of converting all 50+ blocks at once:

**Phase 1: Identify Critical Blocks**
- Audit site to find most-used Stackable blocks
- Prioritize blocks that appear on 80% of pages
- Usually 10-15 blocks cover most use cases

**Phase 2: Convert Critical Blocks First**
- Convert top 10-15 blocks to headless-ready
- Keep Stackable plugin for remaining blocks
- Test headless rendering with critical blocks

**Phase 3: Gradual Migration**
- Convert remaining blocks as needed
- Remove Stackable dependency block by block
- Complete migration over 6-12 months

**Benefits:**
- ✅ Faster initial delivery (2-3 months vs 6-8 months)
- ✅ Lower risk (test with critical blocks first)
- ✅ Incremental value (headless works sooner)
- ✅ Flexible timeline (convert as needed)

---

## Comparison: Child Plugin vs Independent Library

| Aspect | Child Plugin | Independent Library |
|--------|--------------|---------------------|
| **Dependencies** | Requires Stackable | Zero dependencies |
| **License** | Bound by Stackable terms | Own license choice |
| **Updates** | Risk of conflicts | Full control |
| **Customization** | Limited by parent | Complete freedom |
| **Maintenance** | Must track Stackable updates | Independent |
| **Headless compatibility** | Still depends on Stackable | Fully headless-ready |
| **Development time** | Faster (reuse code) | Slower (rebuild) |
| **Long-term viability** | ⚠️ Risky | ✅ Sustainable |

**Recommendation:** **Independent Library** for long-term headless strategy

---

## Next Steps & Recommendations

### Immediate Actions

1. **Audit Current Usage**
   - List all Stackable blocks in use
   - Identify most-used blocks (top 10-15)
   - Document block configurations

2. **Proof of Concept**
   - Convert 2-3 simple blocks (button, heading, text)
   - Test headless rendering
   - Validate Plan C+ architecture

3. **Decision Point**
   - Evaluate POC results
   - Decide: Full conversion vs Gradual migration
   - Allocate resources

### If Proceeding with Full Conversion

1. **Set up project structure**
   ```bash
   mkdir stackable-fse
   cd stackable-fse
   npm init -y
   # Set up Vite, TypeScript, React
   ```

2. **Create conversion template**
   - Use `voxel-widget-conversion-master-guide.md` as reference
   - Create block template with all required files
   - Document conversion checklist

3. **Start with simple blocks**
   - Button, Heading, Text (week 1)
   - Card, Icon, Spacer (week 2)
   - Build momentum and patterns

4. **Establish patterns**
   - Shared component structure
   - Control mapping patterns
   - CSS inheritance strategy
   - REST API patterns

### If Choosing Gradual Migration

1. **Convert critical blocks first** (10-15 blocks)
2. **Test headless rendering**
3. **Deploy to production**
4. **Convert remaining blocks incrementally**

---

## Conclusion

**Is it worthwhile?** ✅ **YES**, if:
- You need headless compatibility
- You want long-term control
- You have 6-8 months development time
- You're building a production system

**Should you create a child plugin?** ❌ **NO**
- Independent library is better long-term
- Avoids license and dependency issues
- Full architectural control

**Recommended approach:**
1. Start with **gradual migration** (convert critical blocks first)
2. Build **independent library** (not child plugin)
3. Follow **Plan C+ architecture** (from master guide)
4. Use **Stackable as design reference** (not code source)

**Timeline:** 6-8 months for full conversion, or 2-3 months for critical blocks only.

---

## References

- **Master Guide:** `docs/conversions/voxel-widget-conversion-master-guide.md`
- **Headless Architecture:** `docs/headless-architecture/02-headless-architecture-options-summary.md`
- **Plan C+ Pattern:** Section 2 of master guide
- **Stackable Plugin:** `plugins/stackable-ultimate-gutenberg-blocks-premium/`

---

**Document Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** VoxelFSE Development Team

