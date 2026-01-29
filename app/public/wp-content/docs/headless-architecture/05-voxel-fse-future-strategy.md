# Voxel FSE Future Strategy

**Date:** December 2025
**Context:** Voxel plans to release FSE compatibility in ~1 year (2026)
**Question:** Should we wait for Voxel FSE or build now?

---

## Recommended Approach: Build Now, Adopt Later

### Phase 1: Now (Dec 2025 - Mar 2026)

**Build Core Infrastructure:**

```
✅ Voxel REST API endpoints
   └─ /voxel/v1/post-type-filters
   └─ /voxel/v1/post-type-fields
   └─ /voxel/v1/post-types

✅ Essential blocks (Option C+)
   └─ Search Form (VX)
   └─ Post Feed (VX)
   └─ Create Post (VX)

✅ Next.js frontend foundation
   └─ ISR configuration
   └─ WPGraphQL integration
   └─ Supabase setup
```

**Timeline:** 12 weeks
**Result:** Working headless site

---

### Phase 2: Voxel FSE Release (~2026)

**Evaluate Voxel FSE Blocks:**

```bash
# When Voxel FSE releases, check their blocks

# 1. Inspect block registration
find wp-content/themes/voxel -name "block.json"

# 2. Check for render_callback
grep -r "render_callback" wp-content/themes/voxel

# 3. Test headless compatibility
# Query via WPGraphQL - does block data appear?
```

**Decision Matrix:**

| Voxel FSE Feature | Action |
|-------------------|--------|
| ✅ Headless compatible | Adopt directly |
| ⚠️ render_callback only | Convert to Option C+ |
| ✅ Good edit.tsx | Copy and enhance |
| ⚠️ Missing features | Keep custom blocks |

---

### Phase 3: Selective Adoption (2026+)

**Strategy:** Use the best of both worlds

```
┌─────────────────────────────────────────────────┐
│              YOUR ARCHITECTURE                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ Keep Custom Blocks (Option C+):             │
│     • Search Form (better performance)          │
│     • Create Post (custom features)             │
│     • Timeline Feed (Supabase integration)      │
│                                                  │
│  ✅ Adopt Voxel FSE Blocks (if headless):       │
│     • Basic UI blocks (if compatible)           │
│     • Simple display blocks                     │
│                                                  │
│  ✅ Convert Voxel FSE → C+ (if needed):         │
│     • Complex blocks with render_callback       │
│     • Blocks needing customization              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Conversion Example: Voxel FSE Block → Option C+

### Voxel FSE Block (Their Implementation)

**voxel/blocks/search-form/block.json**
```json
{
  "apiVersion": 2,
  "name": "voxel/search-form",
  "title": "Search Form",
  "attributes": {
    "postType": { "type": "string" },
    "enabledFilters": { "type": "array" },
    "submitBehavior": { "type": "string" }
  },
  "editorScript": "file:./index.js",
  "render": "file:./render.php"
}
```

**voxel/blocks/search-form/render.php**
```php
<?php
// ❌ Server-side rendering (not headless compatible)

$post_type = \Voxel\Post_Type::get($attributes['postType']);
$filters = $post_type->get_filters();

?>
<div class="ts-form ts-search-widget">
    <?php foreach ($filters as $filter): ?>
        <div class="ts-filter">
            <?php $filter->render(); ?>
        </div>
    <?php endforeach; ?>
</div>
```

**voxel/blocks/search-form/index.js**
```tsx
// ✅ React editor (can reuse)

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

registerBlockType('voxel/search-form', {
    edit: ({ attributes, setAttributes }) => {
        return (
            <>
                <InspectorControls>
                    <PanelBody title="Settings">
                        <SelectControl
                            label="Post Type"
                            value={attributes.postType}
                            options={postTypeOptions}
                            onChange={(value) => setAttributes({ postType: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <div className="voxel-search-form-preview">
                    {/* Editor preview */}
                </div>
            </>
        );
    }
});
```

---

### Your Converted Block (Option C+)

**voxel-fse/blocks/search-form/block.json**
```json
{
  "apiVersion": 2,
  "name": "voxel-fse/search-form",
  "title": "Search Form (Headless)",
  "attributes": {
    "postType": { "type": "string" },
    "enabledFilters": { "type": "array" },
    "submitBehavior": { "type": "string" },
    "filterSource": { "type": "string", "default": "voxel-api" }
  },
  "editorScript": "file:./index.js"
}
```

**voxel-fse/blocks/search-form/index.tsx**
```tsx
// ✅ Copy Voxel's edit component
// ✅ Add your save function

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useVoxelFilters } from './hooks/useVoxelFilters';

registerBlockType('voxel-fse/search-form', {
    edit: ({ attributes, setAttributes }) => {
        // Copy from Voxel's edit component
        const { filters, isLoading } = useVoxelFilters(attributes.postType);

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Settings">
                        <SelectControl
                            label="Post Type"
                            value={attributes.postType}
                            options={postTypeOptions}
                            onChange={(value) => setAttributes({ postType: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <SearchFormPreview filters={filters} isLoading={isLoading} />
            </>
        );
    },

    // ✅ NEW: Add save function (use your proven pattern)
    save: ({ attributes }) => {
        return (
            <div
                className="ts-form ts-search-widget"
                data-post-type={attributes.postType}
                data-enabled-filters={JSON.stringify(attributes.enabledFilters)}
                data-filter-source={attributes.filterSource}
            >
                {/* Placeholder for Next.js hydration */}
            </div>
        );
    }
});
```

**NO render.php needed** - Uses your existing Voxel REST API

---

## Benefits of Building Now

### 1. Immediate Value

**Go headless in 12 weeks:**
- ✅ Vercel Next.js frontend live
- ✅ ISR caching (instant page loads)
- ✅ Supabase real-time features
- ✅ Modern tech stack

**vs. Waiting:**
- ❌ 1 year delay
- ❌ WordPress-only site
- ❌ No real-time features
- ❌ Uncertain Voxel FSE release date

---

### 2. Future-Proof Foundation

**When Voxel FSE releases, you'll have:**

```
✅ Voxel REST API infrastructure
   • Already handles all Voxel data
   • Proven and tested
   • Ready for new blocks

✅ Option C+ conversion patterns
   • block.json templates
   • save() function patterns
   • API integration hooks

✅ Next.js frontend architecture
   • ISR configuration
   • WPGraphQL setup
   • Supabase integration

✅ Conversion experience
   • Know what works
   • Know what doesn't
   • Faster conversions
```

**Converting Voxel FSE blocks will be:**
- 70% faster (copy edit.tsx, add save.tsx)
- Lower risk (proven patterns)
- Optional (keep what works)

---

### 3. Flexibility

**You're not locked in:**

| Scenario | Your Response |
|----------|---------------|
| Voxel FSE is perfect | ✅ Adopt their blocks |
| Voxel FSE uses render.php | ✅ Convert to Option C+ |
| Voxel FSE is delayed | ✅ Already have working site |
| Voxel FSE lacks features | ✅ Keep custom blocks |
| Mix of both | ✅ Use best of both worlds |

---

### 4. Competitive Advantage

**Launch headless now:**
- ✅ Better performance than competitors
- ✅ Modern user experience
- ✅ Real-time features (chat, timeline)
- ✅ Mobile app potential (Supabase API)

**vs. Waiting:**
- ⚠️ Competitors launch headless first
- ⚠️ Stuck with WordPress limitations
- ⚠️ Lose 1 year of market opportunity

---

## Risk Analysis

### Risk: Voxel FSE is Headless Compatible

**Probability:** Low (~10%)
**Why unlikely:**
- Voxel's entire codebase uses PHP rendering
- Rebuilding in React = massive effort
- Most WordPress users don't need headless
- They optimize for WordPress-only use case

**If it happens:**
- ✅ Great! Adopt their blocks
- ✅ Your custom blocks still work
- ✅ Your API infrastructure still useful
- ✅ No wasted effort (you had working site for 1 year)

---

### Risk: Voxel FSE Better Than Your Blocks

**Probability:** Medium (~30%)
**Why possible:**
- Official support and updates
- More resources (Voxel team vs you)
- Better integration with Voxel core

**If it happens:**
- ✅ Evaluate block by block
- ✅ Convert superior blocks to Option C+
- ✅ Keep custom blocks that are better
- ✅ Use conversion knowledge (faster/easier)

---

### Risk: Wasted Effort

**Probability:** Very Low (~5%)
**Why unlikely:**
- You need blocks NOW for headless
- Knowledge gained is transferable
- API infrastructure is reusable
- Working site has business value

**Even if Voxel FSE is perfect:**
- ✅ You had headless site 1 year earlier
- ✅ You learned Option C+ architecture
- ✅ You validated headless approach
- ✅ Conversion to Voxel FSE is trivial

---

## Conversion Effort Comparison

### Widget → Custom FSE (Now)

```
Search Form:        20 hours
Post Feed:          16 hours
Create Post:        24 hours
Product Price:      12 hours
Timeline Feed:      20 hours
User Profile:       16 hours
Booking Calendar:   24 hours
Event Listings:     16 hours
Venue Directory:    16 hours
Chat Widget:        20 hours
───────────────────────────
TOTAL:             184 hours (4.6 weeks)
```

### Voxel FSE → Option C+ (Future)

```
Search Form:         6 hours  (copy edit, add save)
Post Feed:           5 hours  (copy edit, add save)
Create Post:         7 hours  (copy edit, add save)
Product Price:       4 hours  (copy edit, add save)
Timeline Feed:       6 hours  (keep custom - Supabase)
User Profile:        5 hours  (copy edit, add save)
Booking Calendar:    7 hours  (copy edit, add save)
Event Listings:      5 hours  (copy edit, add save)
Venue Directory:     5 hours  (copy edit, add save)
Chat Widget:         6 hours  (keep custom - Supabase)
───────────────────────────
TOTAL:              56 hours (1.4 weeks)
```

**Savings:** 70% less effort

**Why so much faster:**
- ✅ block.json already defined
- ✅ edit.tsx already built
- ✅ Inspector controls already exist
- ✅ API infrastructure already exists
- ✅ Proven save() patterns
- ✅ No research/experimentation needed

---

## Recommended Timeline

### Phase 1: Build Now (Weeks 1-12)

**Weeks 1-2:** Foundation
- ✅ Voxel REST API controller
- ✅ useVoxelFilters hook
- ✅ Next.js ISR setup

**Weeks 3-6:** Core Blocks
- ✅ Search Form (VX)
- ✅ Post Feed (VX)
- ✅ Create Post (VX)
- ✅ Product Price (VX)

**Weeks 7-8:** Supabase Integration
- ✅ Database schema
- ✅ Sync controller
- ✅ Authentication flow

**Weeks 9-10:** Real-Time Features
- ✅ Timeline Feed (VX)
- ✅ Chat Widget (VX)
- ✅ Notifications

**Weeks 11-12:** Testing & Launch
- ✅ Security audit
- ✅ Performance testing
- ✅ Production deployment

**Result:** Fully functional headless site

---

### Phase 2: Monitor Voxel FSE (2026)

**When Voxel announces FSE release:**

```bash
# Subscribe to Voxel updates
# Monitor GitHub/changelog
# Test beta versions
```

**Evaluation checklist:**
- [ ] Check for render_callback usage
- [ ] Test WPGraphQL compatibility
- [ ] Compare edit components
- [ ] Assess feature completeness
- [ ] Evaluate performance

---

### Phase 3: Selective Adoption (2026+)

**For each Voxel FSE block:**

```
┌─────────────────────────────────────┐
│   Is it headless compatible?        │
└──────────┬────────────────┬─────────┘
           │                │
         YES               NO
           │                │
           ▼                ▼
    ┌─────────┐      ┌──────────┐
    │ Adopt   │      │ Convert  │
    │ directly│      │ to C+    │
    └─────────┘      └──────────┘
           │                │
           └────────┬───────┘
                    ▼
         ┌──────────────────┐
         │ Test thoroughly  │
         └──────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │ Deploy to prod   │
         └──────────────────┘
```

**Time per block:** 1-2 days (vs 3-5 days building from scratch)

---

## Decision Matrix

| Factor | Build Now | Wait for Voxel FSE |
|--------|-----------|-------------------|
| **Time to headless** | ✅ 12 weeks | ❌ 52+ weeks |
| **Risk** | ✅ Low (proven tech) | ⚠️ Medium (uncertain release) |
| **Effort** | ⚠️ 184 hours now | ✅ 56 hours later? |
| **Future-proof** | ✅ API infrastructure reusable | ⚠️ May still need conversion |
| **Flexibility** | ✅ Full control | ⚠️ Dependent on Voxel |
| **Business value** | ✅ Immediate | ❌ Delayed 1 year |
| **Learning** | ✅ Deep understanding | ⚠️ Less control |
| **Maintenance** | ⚠️ You maintain | ✅ Voxel maintains |

---

## Final Recommendation

### Build Now, Adopt Selectively Later

**Reasoning:**

1. **Immediate Value**
   - Headless site in 12 weeks vs 52+ weeks
   - Competitive advantage
   - Business ROI starts immediately

2. **Future-Proof**
   - API infrastructure is reusable
   - Conversion knowledge transfers
   - Not locked into Voxel's decisions

3. **Low Risk**
   - Even if Voxel FSE is perfect, you had working site for 1 year
   - Conversion to Voxel FSE is 70% faster with experience
   - Can selectively adopt what's better

4. **Best of Both Worlds**
   - Use Voxel FSE blocks that are headless compatible
   - Convert ones that aren't (proven pattern, fast)
   - Keep custom blocks that are superior (Supabase integration)

**The 184 hours you invest now:**
- ✅ Gets you headless site 1 year earlier
- ✅ Generates business value immediately
- ✅ Provides conversion expertise for future
- ✅ Reduces future conversion effort by 70%

**ROI Calculation:**
```
Cost of building now:        184 hours
Cost of waiting:            1 year delay
Value of headless site:     Immediate
Future conversion savings:  128 hours (184 - 56)

Net benefit: -184 hours + 1 year head start + 128 hours saved
           = 1 year competitive advantage - 56 hours
```

**Conclusion:** Build now, evaluate Voxel FSE when released, adopt selectively.

---

## Action Plan

**Today:**
- ✅ Proceed with Option C+ architecture
- ✅ Build Voxel REST API infrastructure
- ✅ Convert essential blocks

**2026 (When Voxel FSE releases):**
- ✅ Evaluate headless compatibility
- ✅ Test with WPGraphQL
- ✅ Compare features vs your blocks

**Decision Point:**
- ✅ Adopt Voxel FSE blocks that are headless compatible
- ✅ Convert render_callback blocks to Option C+ (fast, proven)
- ✅ Keep superior custom blocks (Supabase integration)

**Result:**
- ✅ Best possible architecture
- ✅ Minimal wasted effort
- ✅ Maximum flexibility
- ✅ Competitive advantage maintained
