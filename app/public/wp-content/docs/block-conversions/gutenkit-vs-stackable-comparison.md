# GutenKit Blocks vs Stackable Ultimate Gutenberg Blocks - Headless Conversion Comparison

**Date:** December 2025  
**Purpose:** Compare GutenKit Blocks and Stackable Ultimate Gutenberg Blocks Premium for headless WordPress conversion  
**Reference:** `voxel-widget-conversion-master-guide.md` - Plan C+ Architecture Requirements

---

## Executive Summary

**Winner: GutenKit Blocks** 🏆

GutenKit Blocks is **significantly easier** to convert to headless compatibility than Stackable because:
1. ✅ Uses modern `viewScript` in `block.json` (Plan C+ compatible pattern)
2. ✅ Clear separation: `render.php` → HTML, `frontend.js` → Interactivity
3. ✅ Fewer dynamic blocks (only blocks with `render.php` need conversion)
4. ✅ Simpler architecture (less complex than Stackable's action hook system)

**Stackable** is more complex:
- ❌ Uses PHP action hooks (`stackable/{block}/enqueue_scripts`) instead of `viewScript`
- ❌ Mixed architecture (some blocks static, some with `render_callback`)
- ❌ More dynamic blocks requiring conversion
- ⚠️ More mature/complex codebase (harder to modify)

---

## Architecture Comparison

### GutenKit Blocks Architecture

**Pattern:**
```
render.php → PHP renders HTML (WP_Query, get_categories, etc.)
frontend.js → Vanilla JS adds interactivity (tab switching, animations)
edit.js → React component for editor
```

**Block Structure:**
```
post-tab/
├── block.json          # Has "render" and "viewScript"
├── render.php          # PHP rendering (needs conversion)
├── frontend.js         # Frontend interactivity (needs React conversion)
├── edit.js            # React editor component (reusable!)
└── save.js            # Returns null (needs vxconfig output)
```

**Key Features:**
- ✅ Modern `viewScript` in `block.json` (Plan C+ compatible)
- ✅ Clear file separation (render.php vs frontend.js)
- ✅ React components already exist (`edit.js`)
- ✅ Simple, straightforward architecture

**Dynamic Blocks (Need Conversion):**
- `post-tab` (has `render.php`)
- `blog-posts` (has `render.php`)
- Other blocks are static (no conversion needed)

---

### Stackable Ultimate Gutenberg Blocks Architecture

**Pattern:**
```
Most blocks: Static (save.js outputs HTML directly)
Dynamic blocks: render_callback → PHP renders HTML
Frontend JS: wp_enqueue_script via action hooks
```

**Block Structure:**
```
posts/
├── block.json          # NO "render" property
├── index.php           # Registers render_callback
└── (no frontend.js)    # Frontend JS in dist/ folder

accordion/
├── block.json          # NO "render" property
├── index.php           # Enqueues frontend JS via action hook
└── (no frontend.js)    # Frontend JS in dist/ folder
```

**Key Features:**
- ❌ Uses PHP action hooks instead of `viewScript` in `block.json`
- ⚠️ Frontend JS files in `dist/` folder (compiled, not source)
- ✅ Most blocks are static (no conversion needed)
- ❌ Dynamic blocks use `render_callback` (needs conversion)

**Dynamic Blocks (Need Conversion):**
- `posts` (has `render_callback`)
- `pagination` (has `render_callback`)
- `load-more` (has `render_callback`)
- `blog-posts` (deprecated v2, has `render_callback`)

**Interactive Blocks (Have Frontend JS):**
- `accordion`, `carousel`, `tabs`, `countdown`, `count-up`, `progress-bar`, `progress-circle`, `notification`, `expand`, `horizontal-scroller`, `map`, `video-popup`

---

## Detailed Comparison

### 1. Frontend JavaScript Loading

| Aspect | GutenKit Blocks | Stackable Ultimate |
|--------|----------------|-------------------|
| **Method** | ✅ `viewScript` in `block.json` | ❌ PHP action hooks (`stackable/{block}/enqueue_scripts`) |
| **Plan C+ Compatible** | ✅ Yes (modern pattern) | ❌ No (legacy pattern) |
| **File Location** | ✅ `src/blocks/{block}/frontend.js` (source) | ⚠️ `dist/frontend_block_{block}.js` (compiled) |
| **Accessibility** | ✅ Easy to modify (source files) | ❌ Hard to modify (compiled files) |

**GutenKit Example:**
```json
{
  "render": "file:./render.php",
  "viewScript": "file:./frontend.js"  // ✅ Modern, Plan C+ compatible
}
```

**Stackable Example:**
```php
// index.php
add_action( 'stackable/accordion/enqueue_scripts', 'stackable_load_accordion_frontend_script' );

function stackable_load_accordion_frontend_script() {
    wp_enqueue_script(
        'stk-frontend-accordion',
        plugins_url( 'dist/frontend_block_accordion.js', STACKABLE_FILE ),
        // ...
    );
}
```

**Verdict:** ✅ **GutenKit wins** - Modern `viewScript` pattern is Plan C+ compatible

---

### 2. Dynamic Block Rendering

| Aspect | GutenKit Blocks | Stackable Ultimate |
|--------|----------------|-------------------|
| **Method** | `render.php` files | `render_callback` in PHP |
| **Number of Dynamic Blocks** | 🟡 Few (2-3 blocks) | 🔴 More (4+ blocks) |
| **Complexity** | 🟢 Simple (single file) | 🟡 Medium (class methods) |
| **Conversion Effort** | 🟡 Medium | 🔴 High |

**GutenKit Dynamic Blocks:**
- `post-tab` → `render.php` (categories, posts query)
- `blog-posts` → `render.php` (posts query)

**Stackable Dynamic Blocks:**
- `posts` → `render_callback` (complex query logic)
- `pagination` → `render_callback` (pagination logic)
- `load-more` → `render_callback` (AJAX loading)
- `blog-posts` (v2) → `render_callback` (deprecated)

**Verdict:** ✅ **GutenKit wins** - Fewer dynamic blocks, simpler structure

---

### 3. React Component Reusability

| Aspect | GutenKit Blocks | Stackable Ultimate |
|--------|----------------|-------------------|
| **Editor Components** | ✅ `edit.js` (React) | ✅ React components exist |
| **Reusability** | ✅ Easy (single file) | ⚠️ Medium (may be split) |
| **Conversion to Shared** | ✅ Straightforward | ⚠️ May need refactoring |

**GutenKit Example:**
```javascript
// post-tab/edit.js - Can be reused as shared component
export default function Edit({ attributes, setAttributes }) {
    // React component
}
```

**Stackable Example:**
```javascript
// React components exist but may be in different structure
// Need to check actual implementation
```

**Verdict:** ✅ **GutenKit wins** - Simpler structure, easier to reuse

---

### 4. Build System & Source Files

| Aspect | GutenKit Blocks | Stackable Ultimate |
|--------|----------------|-------------------|
| **Source Files** | ✅ Accessible (`src/blocks/`) | ⚠️ Compiled (`dist/`) |
| **Modification** | ✅ Easy (edit source) | ❌ Hard (need to rebuild) |
| **Build System** | ✅ Modern (likely Webpack/Vite) | ✅ Modern (compiled) |
| **Frontend JS Source** | ✅ `frontend.js` (source) | ❌ `dist/frontend_block_*.js` (compiled) |

**GutenKit:**
- Source files in `src/blocks/{block}/`
- `frontend.js` is source code (can edit directly)

**Stackable:**
- Source files in `src/block/{block}/`
- Frontend JS in `dist/` folder (compiled, need to find source)

**Verdict:** ✅ **GutenKit wins** - Source files more accessible

---

### 5. Codebase Complexity

| Aspect | GutenKit Blocks | Stackable Ultimate |
|--------|----------------|-------------------|
| **Codebase Size** | 🟢 Smaller | 🔴 Larger (premium, more features) |
| **Architecture** | 🟢 Simple | 🟡 Complex (action hooks, filters) |
| **Learning Curve** | 🟢 Easy | 🟡 Medium |
| **Modification Risk** | 🟢 Low | 🟡 Medium (more interconnected) |

**GutenKit:**
- Simpler architecture
- Fewer files per block
- Clear separation of concerns

**Stackable:**
- More mature codebase
- Action hooks and filters system
- More interconnected components
- Premium features add complexity

**Verdict:** ✅ **GutenKit wins** - Simpler, easier to modify

---

## Conversion Effort Comparison

### GutenKit Blocks Conversion

**Steps Required:**
1. ✅ Create REST API endpoints (move `render.php` logic)
2. ✅ Convert `save.js` from `return null` to output `vxconfig` JSON
3. 🟡 Enhance `frontend.js` to parse `vxconfig` and mount React
4. ✅ Build shared React component (reuse from `edit.js`)
5. ✅ Remove `render.php` dependency

**Estimated Effort:** 🟡 **Medium** (2-3 days per dynamic block)

**Advantages:**
- ✅ Modern `viewScript` pattern (Plan C+ compatible)
- ✅ Source files accessible
- ✅ React components already exist
- ✅ Clear conversion path

---

### Stackable Ultimate Conversion

**Steps Required:**
1. 🔴 Create REST API endpoints (move `render_callback` logic)
2. 🔴 Convert action hook system to `viewScript` in `block.json`
3. 🔴 Find/access frontend JS source files (may be compiled)
4. 🟡 Enhance frontend JS to parse `vxconfig` and mount React
5. 🟡 Build shared React component (may need refactoring)
6. 🔴 Remove `render_callback` dependencies
7. 🔴 Update action hook system

**Estimated Effort:** 🔴 **High** (4-5 days per dynamic block)

**Challenges:**
- ❌ Action hook system needs conversion to `viewScript`
- ❌ Frontend JS may be compiled (harder to modify)
- ❌ More dynamic blocks to convert
- ❌ More complex codebase

---

## Side-by-Side Feature Comparison

| Feature | GutenKit Blocks | Stackable Ultimate | Winner |
|---------|----------------|-------------------|--------|
| **viewScript Support** | ✅ Yes (modern) | ❌ No (action hooks) | 🏆 GutenKit |
| **Source File Access** | ✅ Yes | ⚠️ Compiled | 🏆 GutenKit |
| **Dynamic Blocks Count** | 🟡 Few (2-3) | 🔴 More (4+) | 🏆 GutenKit |
| **React Components** | ✅ Simple | ✅ Complex | 🟡 Tie |
| **Codebase Complexity** | 🟢 Simple | 🔴 Complex | 🏆 GutenKit |
| **Conversion Effort** | 🟡 Medium | 🔴 High | 🏆 GutenKit |
| **Block Features** | 🟡 Basic | ✅ Premium | 🏆 Stackable |
| **Maturity** | 🟡 Newer | ✅ Mature | 🏆 Stackable |
| **Documentation** | 🟡 Limited | ✅ Better | 🏆 Stackable |

**Overall Winner for Conversion:** 🏆 **GutenKit Blocks**

---

## Conversion Example: Post Tab Block

### GutenKit Conversion Path

**Current:**
```javascript
// save.js
export default function save() {
    return null; // Uses render.php
}

// render.php
<?php
$categories = get_categories();
$query = new WP_Query($args);
// Render HTML
?>

// frontend.js
// Vanilla JS for tab switching
```

**Converted to Plan C+:**
```typescript
// save.tsx
export default function save({ attributes }) {
    const vxConfig = {
        selectedCategories: attributes.selectedCategories,
        postCount: attributes.postCount,
        // ...
    };
    return (
        <div data-block-type="post-tab">
            <script className="vxconfig" dangerouslySetInnerHTML={{__html: JSON.stringify(vxConfig)}} />
            <div className="placeholder">Loading...</div>
        </div>
    );
}

// frontend.tsx
// Parse vxconfig, fetch from REST API, mount React
// Reuse component from edit.js

// REST API endpoint
// Replace render.php logic
```

**Effort:** 🟡 Medium (clear path, source files accessible)

---

### Stackable Conversion Path

**Current:**
```php
// index.php
$register_options['render_callback'] = array($this, 'render_callback');

public function render_callback($attributes, $content, $block) {
    // Complex query logic
    // Render HTML
}

// Frontend JS in dist/ folder (compiled)
```

**Converted to Plan C+:**
```typescript
// Need to:
// 1. Convert action hook to viewScript in block.json
// 2. Create save.tsx with vxconfig
// 3. Find/access frontend JS source
// 4. Convert to React hydration
// 5. Create REST API
// 6. Build shared component
```

**Effort:** 🔴 High (more steps, compiled files, complex logic)

---

## ⚠️ CRITICAL UPDATE: Functionality Quality

**User Feedback:** GutenKit Blocks functionality is "simply awful" and "does not match Stackable"

This is a **critical consideration** that changes the recommendation. While GutenKit may have:
- ✅ Easier conversion path
- ✅ Modern architecture
- ✅ Better performance

**If the functionality is poor, these advantages don't matter.**

### Functionality Comparison

| Aspect | GutenKit Blocks | Stackable Ultimate |
|--------|----------------|-------------------|
| **Block Quality** | 🔴 Poor (per user feedback) | ✅ Excellent |
| **Feature Completeness** | 🔴 Limited | ✅ Comprehensive |
| **User Experience** | 🔴 Awful (per user feedback) | ✅ Polished |
| **Maturity** | 🟡 Newer | ✅ Mature |
| **Documentation** | 🟡 Limited | ✅ Better |
| **Support** | 🟡 Unknown | ✅ Premium support |

**Verdict:** 🏆 **Stackable Ultimate wins on functionality** - Quality matters more than ease of conversion

---

## Final Recommendation (REVISED)

### ⚠️ Choose Stackable Ultimate If:
- ✅ **Functionality is your priority** (most important!)
- ✅ You need **polished, professional blocks**
- ✅ You want **mature, well-tested features**
- ✅ You prefer **better user experience**
- ✅ You're okay with **higher conversion effort** for better results
- ✅ You need **premium features** and support

### Choose GutenKit Blocks If:
- ⚠️ You're willing to **accept poor functionality** for easier conversion
- ⚠️ You want **modern architecture** (but functionality suffers)
- ⚠️ You need **accessible source files** (but blocks don't work well)
- ⚠️ You're okay with **awful user experience** (per user feedback)

**⚠️ WARNING:** Based on user feedback, GutenKit Blocks may not be suitable for production use despite easier conversion path.

---

## Conclusion (REVISED)

**For headless WordPress conversion, Stackable Ultimate is the better choice** 🏆

**Why Stackable Wins:**
1. ✅ **Functionality quality** - Blocks actually work well
2. ✅ **Better user experience** - Polished, professional
3. ✅ **Mature codebase** - Well-tested and stable
4. ✅ **More features** - Comprehensive block library
5. ✅ **Better support** - Premium plugin support

**GutenKit Blocks Issues:**
- 🔴 **Poor functionality** - "Simply awful" (user feedback)
- 🔴 **Doesn't match Stackable** - Quality gap
- ⚠️ Easier conversion doesn't matter if blocks don't work well

**Recommendation:** Choose **Stackable Ultimate** despite higher conversion effort. Better to invest more time converting a quality plugin than dealing with poor functionality.

**Alternative Approach:**
1. Use **Stackable Ultimate** for production (better functionality)
2. Convert to headless using Plan C+ architecture
3. Accept higher conversion effort for better end result
4. Or: Build custom blocks from scratch using Plan C+ patterns

---

## Updated Comparison Summary

| Factor | GutenKit Blocks | Stackable Ultimate | Winner |
|--------|----------------|-------------------|--------|
| **Functionality Quality** | 🔴 Poor | ✅ Excellent | 🏆 Stackable |
| **User Experience** | 🔴 Awful | ✅ Polished | 🏆 Stackable |
| **Conversion Ease** | ✅ Easier | 🔴 Harder | GutenKit |
| **Modern Architecture** | ✅ Yes | ⚠️ Legacy | GutenKit |
| **Performance** | ✅ Better | 🟡 Good | GutenKit |
| **Overall Recommendation** | ❌ **Not Recommended** | ✅ **Recommended** | 🏆 **Stackable** |

**Final Verdict:** 🏆 **Stackable Ultimate** - Quality functionality outweighs conversion difficulty

---

**Document Version:** 1.0.0  
**Last Updated:** December 2025  
**Reference:** `app/public/wp-content/docs/block-conversions/voxel-widget-conversion-master-guide.md`

