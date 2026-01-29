# Essential Blocks Headless Migration Guide

**Date:** December 14, 2025  
**Purpose:** Complete guide for porting Essential Blocks to headless-ready versions  
**Strategy:** Keep Essential Blocks enabled, port blocks one-by-one

---

## Executive Summary

**The Strategy:** Port entire Essential Blocks blocks to headless-ready versions by keeping `edit.tsx` AS-IS and only modifying `save.tsx` to output vxconfig.

| Question | Answer |
|----------|--------|
| **Need Essential Blocks enabled?** | ✅ **YES** - Keep it enabled |
| **Port entire blocks or just controls?** | ✅ **Entire blocks** (edit + save + styles) |
| **Modify edit.tsx?** | ❌ **NO** - Keep AS-IS |
| **Modify save.tsx?** | ✅ **YES** - Replace with vxconfig |
| **Time per block?** | ⏱️ **2-4 hours** |
| **Time savings vs building from scratch?** | 🚀 **90% faster** |

---

## Why This Strategy?

### ❌ **Don't Do This** (Building from Scratch)

```
Build custom block from scratch
  ↓
Create all controls manually
  ↓
Build all features manually
  ↓
Test everything
  ↓
20-40 hours per block ❌
```

### ✅ **Do This** (Port Essential Blocks)

```
Copy Essential Blocks block
  ↓
Keep edit.tsx AS-IS (all features included!)
  ↓
Replace save.tsx with vxconfig
  ↓
Build Next.js component
  ↓
2-4 hours per block ✅
```

**Time savings: 90%!** 🚀

---

## Architecture

### Before (Essential Blocks - Traditional)

```
┌─────────────────────────────────────────────────────────┐
│                    EDITOR (edit.js)                      │
│                                                          │
│  InspectorPanel (all controls)                          │
│  Block preview                                          │
│  All Essential Blocks features                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    SAVE (save.js)                        │
│                                                          │
│  BlockProps.Save                                        │
│    ↓ Generates CSS from attributes                      │
│  <div style="...">                                      │
│    {/* Content */}                                      │
│  </div>                                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              WORDPRESS FRONTEND (PHP)                    │
│                                                          │
│  Renders static HTML with inline styles                 │
│  ❌ NOT headless-compatible                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### After (Essential Blocks - Headless-Ready)

```
┌─────────────────────────────────────────────────────────┐
│                    EDITOR (edit.tsx)                     │
│                                                          │
│  InspectorPanel (all controls) ← SAME! ✅               │
│  Block preview ← SAME! ✅                               │
│  All Essential Blocks features ← SAME! ✅               │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    SAVE (save.tsx)                       │
│                                                          │
│  Output vxconfig JSON ← MODIFIED! ⚠️                    │
│  <div data-block-type="flex-container">                 │
│    <script class="vxconfig">                            │
│      { ...all attributes }                              │
│    </script>                                            │
│  </div>                                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS FRONTEND                        │
│                                                          │
│  Parse vxconfig → Render like Essential Blocks          │
│  Match Essential Blocks CSS/HTML exactly                │
│  ✅ Headless-compatible                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Step-by-Step: Port a Block

### Example: Flex Container Block

#### Step 1: Copy Entire Block (15 minutes)

```bash
# Copy from Essential Blocks to your theme
cp -r "C:/Users/herle/Local Sites/musicalwheel/app/public/wp-content/plugins/essential-blocks/src/blocks/flex-container" \
     "C:/Users/herle/Local Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/flex-container"
```

**Result:**
```
themes/voxel-fse/app/blocks/src/flex-container/
├── edit.tsx         # ✅ Keep AS-IS
├── save.tsx         # ⚠️ Will replace
├── style.scss       # ✅ Keep AS-IS
├── block.json       # ⚠️ Will modify
├── attributes.ts    # ✅ Keep AS-IS
└── index.ts         # ⚠️ Will modify
```

#### Step 2: Keep edit.tsx AS-IS (0 minutes) ✅

**File:** `themes/voxel-fse/app/blocks/src/flex-container/edit.tsx`

```tsx
// This is EXACTLY the same as Essential Blocks
// Don't modify ANYTHING!
// You get ALL features for FREE! 🎉

import { InspectorPanel } from "@essential-blocks/controls";
import { InspectorControls, InnerBlocks, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <InspectorPanel
          advancedControlProps={{
            marginPrefix: "containerMargin",
            paddingPrefix: "containerPadding",
            backgroundPrefix: "containerBackground",
            borderPrefix: "containerBorder",
            hasMargin: true,
            hasPadding: true,
            hasBackground: true,
            hasBorder: true,
            hasResponsive: true,
            hasZIndex: true,
            hasPosition: true,
          }}
        >
          <InspectorPanel.General>
            <PanelBody title={__("Flex Settings", "essential-blocks")}>
              <SelectControl
                label={__("Direction", "essential-blocks")}
                value={attributes.flexDirection}
                options={[
                  { label: __("Row", "essential-blocks"), value: "row" },
                  { label: __("Column", "essential-blocks"), value: "column" },
                  { label: __("Row Reverse", "essential-blocks"), value: "row-reverse" },
                  { label: __("Column Reverse", "essential-blocks"), value: "column-reverse" },
                ]}
                onChange={(value) => setAttributes({ flexDirection: value })}
              />

              <SelectControl
                label={__("Justify Content", "essential-blocks")}
                value={attributes.justifyContent}
                options={[
                  { label: __("Start", "essential-blocks"), value: "flex-start" },
                  { label: __("Center", "essential-blocks"), value: "center" },
                  { label: __("End", "essential-blocks"), value: "flex-end" },
                  { label: __("Space Between", "essential-blocks"), value: "space-between" },
                  { label: __("Space Around", "essential-blocks"), value: "space-around" },
                  { label: __("Space Evenly", "essential-blocks"), value: "space-evenly" },
                ]}
                onChange={(value) => setAttributes({ justifyContent: value })}
              />

              <SelectControl
                label={__("Align Items", "essential-blocks")}
                value={attributes.alignItems}
                options={[
                  { label: __("Start", "essential-blocks"), value: "flex-start" },
                  { label: __("Center", "essential-blocks"), value: "center" },
                  { label: __("End", "essential-blocks"), value: "flex-end" },
                  { label: __("Stretch", "essential-blocks"), value: "stretch" },
                  { label: __("Baseline", "essential-blocks"), value: "baseline" },
                ]}
                onChange={(value) => setAttributes({ alignItems: value })}
              />

              <SelectControl
                label={__("Wrap", "essential-blocks")}
                value={attributes.flexWrap}
                options={[
                  { label: __("No Wrap", "essential-blocks"), value: "nowrap" },
                  { label: __("Wrap", "essential-blocks"), value: "wrap" },
                  { label: __("Wrap Reverse", "essential-blocks"), value: "wrap-reverse" },
                ]}
                onChange={(value) => setAttributes({ flexWrap: value })}
              />

              <RangeControl
                label={__("Gap", "essential-blocks")}
                value={attributes.gap}
                onChange={(value) => setAttributes({ gap: value })}
                min={0}
                max={100}
                step={1}
              />
            </PanelBody>
          </InspectorPanel.General>

          {/* Advanced tab automatically added by InspectorPanel! */}
        </InspectorPanel>
      </InspectorControls>
      
      {/* Preview in editor - same as Essential Blocks */}
      <div {...blockProps}>
        <div
          className="eb-flex-container"
          style={{
            display: 'flex',
            flexDirection: attributes.flexDirection,
            justifyContent: attributes.justifyContent,
            alignItems: attributes.alignItems,
            flexWrap: attributes.flexWrap,
            gap: `${attributes.gap}px`,
          }}
        >
          <InnerBlocks />
        </div>
      </div>
    </>
  );
}
```

**Key Point:** You get ALL Essential Blocks functionality (controls, responsive, animations, etc.) for FREE! 🎉

#### Step 3: Replace save.tsx with vxconfig (30 minutes) ⚠️

**File:** `themes/voxel-fse/app/blocks/src/flex-container/save.tsx`

```tsx
// This is the ONLY file you modify!
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function save({ attributes }) {
  const blockProps = useBlockProps.save();

  // Collect ALL attributes for vxconfig
  const vxConfig = {
    // Flex settings
    flexDirection: attributes.flexDirection,
    justifyContent: attributes.justifyContent,
    alignItems: attributes.alignItems,
    flexWrap: attributes.flexWrap,
    gap: attributes.gap,
    
    // Essential Blocks styling attributes (from Advanced tab)
    containerMargin: attributes.containerMargin,
    containerPadding: attributes.containerPadding,
    containerBackground: attributes.containerBackground,
    containerBorder: attributes.containerBorder,
    
    // Responsive settings
    containerMarginTablet: attributes.containerMarginTablet,
    containerMarginMobile: attributes.containerMarginMobile,
    containerPaddingTablet: attributes.containerPaddingTablet,
    containerPaddingMobile: attributes.containerPaddingMobile,
    
    // Position & Z-Index
    containerPosition: attributes.containerPosition,
    containerZIndex: attributes.containerZIndex,
    
    // Any other Essential Blocks attributes
    // (check attributes.js for complete list)
  };

  return (
    <div {...blockProps} data-block-type="flex-container">
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vxConfig)
        }}
      />
      {/* Placeholder for Next.js hydration */}
      <div className="eb-flex-container-placeholder">
        <InnerBlocks.Content />
      </div>
    </div>
  );
}
```

**That's it!** Only this file changes. Everything else stays the same.

#### Step 4: Build Next.js Component (1-2 hours)

**File:** `apps/musicalwheel-frontend/components/blocks/FlexContainerBlock.tsx`

```tsx
import { ReactNode } from 'react';
import { generateStyles } from '@/lib/blocks/utils/generateStyles';

interface FlexContainerBlockProps {
  vxConfig: {
    flexDirection: string;
    justifyContent: string;
    alignItems: string;
    flexWrap: string;
    gap: number;
    containerMargin: any;
    containerPadding: any;
    containerBackground: any;
    containerBorder: any;
    containerPosition?: string;
    containerZIndex?: number;
  };
  children: ReactNode;
}

export function FlexContainerBlock({ vxConfig, children }: FlexContainerBlockProps) {
  // Generate styles from Essential Blocks attributes
  const containerStyles = generateStyles({
    margin: vxConfig.containerMargin,
    padding: vxConfig.containerPadding,
    background: vxConfig.containerBackground,
    border: vxConfig.containerBorder,
    position: vxConfig.containerPosition,
    zIndex: vxConfig.containerZIndex,
  });

  // Flex-specific styles
  const flexStyles = {
    display: 'flex',
    flexDirection: vxConfig.flexDirection as any,
    justifyContent: vxConfig.justifyContent,
    alignItems: vxConfig.alignItems,
    flexWrap: vxConfig.flexWrap as any,
    gap: `${vxConfig.gap}px`,
  };

  // Combine styles
  const combinedStyles = {
    ...containerStyles,
    ...flexStyles,
  };

  return (
    <div className="eb-flex-container" style={combinedStyles}>
      {children}
    </div>
  );
}
```

**Key Point:** This matches Essential Blocks' frontend rendering exactly!

#### Step 5: Test (1 hour)

**In WordPress:**
1. Open block editor
2. Insert "Flex Container (Headless)" block
3. Add inner blocks
4. Adjust flex settings
5. Adjust margin/padding/background (Advanced tab)
6. Save post

**In Next.js:**
1. Fetch post via WPGraphQL
2. Parse vxconfig
3. Render FlexContainerBlock
4. Verify layout matches WordPress preview
5. Test responsive breakpoints

---

## Essential Blocks Dependency Management

### Keep Essential Blocks Enabled ✅

**Why:**
- ✅ You're using the FULL blocks (not just controls)
- ✅ Essential Blocks handles all complex logic
- ✅ Get updates and bug fixes automatically
- ✅ Faster development (no reinventing the wheel)
- ✅ Battle-tested, well-maintained code

**How:**
```bash
# Keep Essential Blocks installed and activated
wp plugin activate essential-blocks
```

### Hide Non-Ported Blocks from Inserter

**Problem:** Essential Blocks has 70+ blocks, but you only want to show the ones you've ported.

**Solution:** Filter the block inserter

**File:** `themes/voxel-fse/functions.php`

```php
<?php

/**
 * Hide non-ported Essential Blocks from block inserter
 */
add_filter('allowed_block_types_all', function($allowed_blocks, $editor_context) {
    // List of Essential Blocks you've ported to headless
    $ported_essential_blocks = [
        'essential-blocks/flex-container',
        'essential-blocks/row',
        'essential-blocks/wrapper',
        'essential-blocks/advanced-heading',
        'essential-blocks/button',
        // Add more as you port them
    ];
    
    // Get all registered blocks
    $all_blocks = WP_Block_Type_Registry::get_instance()->get_all_registered();
    
    $filtered_blocks = [];
    foreach ($all_blocks as $block_name => $block) {
        // If it's an Essential Block
        if (strpos($block_name, 'essential-blocks/') === 0) {
            // Only allow if it's been ported
            if (in_array($block_name, $ported_essential_blocks)) {
                $filtered_blocks[] = $block_name;
            }
        } else {
            // Allow all non-Essential Blocks
            $filtered_blocks[] = $block_name;
        }
    }
    
    return $filtered_blocks;
}, 10, 2);
```

**Result:**
```
Block Inserter:
📁 Voxel FSE
  - Search Form (Custom)
  - Create Post (Custom)
  
📁 Essential Blocks
  - Flex Container (Headless) ✅
  - Row (Headless) ✅
  - Wrapper (Headless) ✅
  - Advanced Heading (Headless) ✅
  - Button (Headless) ✅
  
  (Other 65+ Essential Blocks hidden)
```

---

## Block Category Organization

### Option 1: Keep Essential Blocks Category ✅ **RECOMMENDED**

**Pros:**
- ✅ Users familiar with Essential Blocks
- ✅ Clear which blocks are from Essential Blocks
- ✅ Easy to find

**Implementation:**
```typescript
// Just register blocks with original category
registerBlockType('essential-blocks/flex-container', {
  category: 'essential-blocks', // Keep original
  title: 'Flex Container (Headless)',
  // ...
});
```

### Option 2: Create "Voxel FSE" Category

**Pros:**
- ✅ All your blocks in one place
- ✅ Clear branding

**Implementation:**
```typescript
registerBlockCollection('voxel-fse', {
  title: 'Voxel FSE',
  icon: 'admin-site-alt3',
});

registerBlockType('voxel-fse/flex-container', {
  category: 'voxel-fse',
  title: 'Flex Container (Headless)',
  // ...
});
```

**Recommendation:** Use **Option 1** (keep Essential Blocks category) for familiarity.

---

## Blocks to Port (Priority Order)

### Phase 1: Layout Blocks (Week 1)

1. **Flex Container** ⭐ - Modern flexbox layouts
2. **Row** - Multi-column layouts
3. **Wrapper** - Container with styling
4. **Section** - Full-width sections
5. **Advanced Tab** - Tabbed content

**Time:** 10-20 hours

### Phase 2: Content Blocks (Week 2)

6. **Advanced Heading** - Headings with styling
7. **Button** - Styled buttons
8. **Info Box** - Icon + text boxes
9. **Call to Action** - CTA sections
10. **Advanced Image** - Images with styling

**Time:** 10-20 hours

### Phase 3: Interactive Blocks (Week 3)

11. **Slider** - Image/content sliders
12. **Image Gallery** - Filterable galleries
13. **Accordion** - Collapsible content
14. **Toggle Content** - Show/hide content
15. **Popup** - Modal popups

**Time:** 10-20 hours

### Phase 4: Advanced Blocks (Week 4)

16. **Testimonial** - Customer testimonials
17. **Pricing Table** - Pricing comparisons
18. **Progress Bar** - Progress indicators
19. **Countdown** - Countdown timers
20. **Form** - Contact forms

**Time:** 10-20 hours

**Total:** 40-80 hours for 20 blocks (vs 400-800 hours building from scratch!)

---

## Timeline Comparison

### Building from Scratch ❌

| Block | Time |
|-------|------|
| Flex Container | 20-40 hours |
| Row | 20-40 hours |
| Wrapper | 15-30 hours |
| Advanced Heading | 10-20 hours |
| Button | 10-20 hours |
| **Total (5 blocks)** | **75-150 hours** |

### Porting Essential Blocks ✅

| Block | Time |
|-------|------|
| Flex Container | 2-4 hours |
| Row | 2-4 hours |
| Wrapper | 2-4 hours |
| Advanced Heading | 2-4 hours |
| Button | 2-4 hours |
| **Total (5 blocks)** | **10-20 hours** |

**Time savings: 85-90%!** 🚀

---

## Complete Workflow

### Per Block (2-4 hours)

```
1. Copy block from Essential Blocks (15 min)
   ↓
2. Keep edit.tsx AS-IS (0 min) ✅
   ↓
3. Replace save.tsx with vxconfig (30 min)
   ↓
4. Build Next.js component (1-2 hours)
   ↓
5. Test in WordPress editor (30 min)
   ↓
6. Test in Next.js frontend (30 min)
   ↓
7. Add to ported blocks list (5 min)
   ↓
8. Done! ✅
```

### Batch Process (10 blocks = 1-2 weeks)

**Week 1:**
- Monday: Flex Container, Row
- Tuesday: Wrapper, Section
- Wednesday: Advanced Tab, Advanced Heading
- Thursday: Button, Info Box
- Friday: Call to Action, Advanced Image

**Week 2:**
- Test all blocks
- Fix any issues
- Document usage
- Train team

---

## Benefits Summary

### ✅ Pros

1. **90% faster** than building from scratch
2. **All Essential Blocks features** included (controls, responsive, animations)
3. **Battle-tested code** - well-maintained by Essential Blocks team
4. **Get updates** - bug fixes and improvements automatically
5. **Consistent UX** - same controls across all blocks
6. **Headless-compatible** - works with Next.js frontend
7. **No reinventing the wheel** - use existing work

### ⚠️ Cons

1. **Essential Blocks dependency** - need plugin enabled (acceptable trade-off)
2. **Two component files** - WordPress + Next.js (unavoidable in headless)
3. **Manual porting** - need to port each block individually (but fast!)
4. **Style generation** - need to build generateStyles() utility (one-time effort)

---

## Implementation Checklist

### Setup (One-time, 2-3 hours)

- [ ] Keep Essential Blocks plugin enabled
- [ ] Create block filter to hide non-ported blocks
- [ ] Set up Next.js block renderer
- [ ] Create generateStyles() utility
- [ ] Create block category (if using custom category)

### Per Block (Repeat, 2-4 hours each)

- [ ] Copy block from Essential Blocks
- [ ] Keep edit.tsx AS-IS (don't modify!)
- [ ] Replace save.tsx with vxconfig
- [ ] Build Next.js component
- [ ] Test in WordPress editor
- [ ] Test in Next.js frontend
- [ ] Add to ported blocks list
- [ ] Update documentation

### Testing (Per Block, 1 hour)

- [ ] Insert block in WordPress editor
- [ ] Adjust all settings (General + Advanced tabs)
- [ ] Save post
- [ ] Fetch via WPGraphQL
- [ ] Render in Next.js
- [ ] Verify styles match
- [ ] Test responsive breakpoints
- [ ] Test on production

---

## Final Recommendation

### ✅ **Port Essential Blocks One-by-One**

**Strategy:**
1. ✅ Keep Essential Blocks plugin **enabled**
2. ✅ Port blocks as needed (not all at once)
3. ✅ Keep `edit.tsx` **AS-IS** (all functionality)
4. ✅ Replace `save.tsx` with **vxconfig**
5. ✅ Build **Next.js component** to match
6. ✅ Hide non-ported blocks from inserter

**Timeline:**
- Per block: 2-4 hours
- 10 blocks: 20-40 hours (1-2 weeks)
- 20 blocks: 40-80 hours (2-4 weeks)

**vs Building from Scratch:**
- Per block: 20-40 hours
- 10 blocks: 200-400 hours (5-10 weeks)
- 20 blocks: 400-800 hours (10-20 weeks)

**Time savings: 85-90%!** 🚀

---

**Document Version:** 2.0.0  
**Last Updated:** December 14, 2025  
**Author:** AI Agent  
**Status:** Unified Migration Guide Complete ✅
