# Timeline Kit Block - Lessons Learned

**Block:** Timeline Style Kit (VX)
**Status:** Complete
**Date:** December 11, 2025
**Type:** FSE Block Conversion from Voxel Widget

---

## Executive Summary

The Timeline Kit block conversion revealed critical insights about child theme CSS management, styling scope conflicts, and the importance of matching Voxel's implementation 1:1. This document captures lessons learned for future block conversions.

---

## Key Learnings

### 1. **CSS Scope Management in Child Themes**

#### The Problem
When extending a parent theme as a child theme, CSS selectors must be carefully scoped to avoid conflicts with parent theme stylesheets.

#### What Happened
1. Initial CSS approach: Created comprehensive styles in `style.css` and `editor.css`
2. Issue: CSS overrode Voxel's critical layout properties (e.g., `.vxf-create-post { display: flex }` overriding parent's `display: grid`)
3. Result: Backend editor layout broke, layout properties conflicted with Voxel's loaded CSS

#### Solution Applied
**Frontend (style.css):** All selectors scoped to `.voxel-fse-timeline-kit` wrapper
**Backend (editor.css):** Minimal styles only (container wrapper), letting Voxel's loaded CSS handle `.vxf-*` styling

```css
/* ✅ CORRECT - Scoped to block wrapper */
.voxel-fse-timeline-kit .vxf-post {
  display: grid;  /* This scoped selector doesn't conflict */
}

/* ❌ WRONG - Unscoped selector conflicts with parent */
.vxf-post {
  display: flex;  /* Conflicts with parent theme */
}
```

#### Key Rule Discovered
**In a child theme extending parent styles:**
- Editor.css = Gutenberg inspector UI only, NOT block preview styling
- Block preview gets CSS from parent theme automatically
- Correct HTML structure matching parent guarantees CSS inheritance
- Additional CSS should be minimal, scoped, and non-conflicting

---

### 2. **Backend vs Frontend CSS Strategy**

#### Editor.css (Backend Block Preview)
**Purpose:** ONLY for Gutenberg block editor UI customization (inspector controls, sidebar panels)
**NOT for:** Block preview styling, layout changes, content display

**Why:**
- Voxel's `social-feed.css` is loaded in WordPress admin
- Block components inherit Voxel's CSS automatically
- Adding block styling to editor.css creates duplicates and conflicts

**Correct pattern:**
```css
/* ✅ OK - Inspector control styling */
.voxel-fse-timeline-kit-editor .ts-form-group {
  margin-bottom: 0;  /* Adjusts editor form layout */
}

/* ❌ WRONG - Block content styling in editor.css */
.voxel-fse-timeline-kit-editor .vxf-post {
  display: grid;  /* Should NOT be in editor.css */
}
```

#### Style.css (Frontend Public Output)
**Purpose:** Style the block output on the frontend public page
**Strategy:** Scope all CSS to block wrapper to avoid parent conflicts

```css
/* ✅ CORRECT - Scoped to block wrapper */
.voxel-fse-timeline-kit .vxf-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
```

---

### 3. **Image URLs Must Match Voxel Exactly**

#### The Problem
Tried using CSS gradients instead of actual background images, resulting in wrong colors/appearance.

#### Discovery
Voxel uses actual image file (`/wp-content/themes/voxel/assets/images/bg.jpg`) not CSS gradients.

#### Impact
- Inline gradient: `style={{ background: 'linear-gradient(...)' }}`
- User feedback: "Colors are different than Voxel"
- Root cause: CSS gradient != actual image file

#### Solution
Reference Voxel's actual image file in all image URLs:
```tsx
// ✅ CORRECT - Uses Voxel's bg.jpg
style={{
  backgroundImage: "url('/wp-content/themes/voxel/assets/images/bg.jpg')"
}}

// ❌ WRONG - CSS gradient doesn't match
style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}}
```

#### Key Rule
**Match Voxel's implementation 1:1:** If Voxel uses image files, use image files (not CSS gradients).

---

### 4. **Demofeed Component Structure**

#### Architecture Pattern
Created reusable `Demofeed.tsx` component with:
- All 8 Voxel timeline items (collapsed/expanded create posts, various post types)
- Shared between editor (edit.tsx) and frontend (save.tsx)
- Represents a complete working timeline example

#### Benefits
1. **Single source of truth:** One component, used in editor + frontend
2. **Consistency:** Editor preview matches frontend output exactly
3. **Maintenance:** Update once, applies everywhere
4. **Demonstration:** Shows all features of Timeline Kit widget

#### HTML Structure Requirements
- All `.vxf-*` classes must match Voxel's social-feed widget HTML exactly
- CSS selectors inherit Voxel's CSS automatically if structure matches
- No custom CSS needed for layout if structure is 1:1 match

---

### 5. **Block Icon Selection**

#### Discovery
Block icons use WordPress Dashicons, not custom SVGs.

#### Implementation
```json
// ✅ CORRECT - Use Dashicon name
"icon": "grid-view"

// ❌ WRONG - Don't use custom SVG object (unless absolutely necessary)
"icon": {
  "src": "<svg>...</svg>"
}
```

#### Voxel Product Price Reference
The Product Price block uses `"icon": "cart"` (simpler Dashicon).
Timeline Kit now matches this pattern with `"icon": "grid-view"` (3x3 grid icon).

---

## Block Conversion Checklist

Based on Timeline Kit experience, here's the checklist for future block conversions:

### 1. HTML Structure Phase
- [ ] Match Voxel widget HTML structure 1:1
- [ ] Verify all CSS classes match parent theme
- [ ] Check for nested elements and structure accuracy
- [ ] Document HTML differences if any (with justification)

### 2. Component Creation
- [ ] Create Demofeed/preview component (if applicable)
- [ ] Use in both edit.tsx and save.tsx for consistency
- [ ] Test both backend editor and frontend output

### 3. CSS Strategy
- [ ] **Frontend (style.css):** Scope all selectors to block wrapper
- [ ] **Backend (editor.css):** Only Gutenberg inspector styles
- [ ] Use parent theme CSS for block styling when structure matches
- [ ] Avoid overriding parent layout properties

### 4. Image Assets
- [ ] Verify image URLs match Voxel's exact paths
- [ ] Use actual image files, not CSS gradients/fallbacks
- [ ] Reference Voxel assets: `/wp-content/themes/voxel/assets/...`

### 5. Block Metadata
- [ ] Add appropriate Dashicon for block.icon
- [ ] Write clear description and keywords
- [ ] Set category to "voxel"
- [ ] Support appropriate alignments (wide, full, etc.)

### 6. Testing
- [ ] Backend: Visual appearance in Gutenberg editor
- [ ] Frontend: Output on public page
- [ ] Compare side-by-side with Voxel original
- [ ] Verify responsive behavior

---

## Technical Insights

### Child Theme CSS Inheritance Pattern

```
Parent Theme (Voxel)
└─ social-feed.css (defines .vxf-post, .vxf-gallery, etc.)

Child Theme (MusicalWheel)
└─ style.css (scoped: .voxel-fse-timeline-kit .vxf-post)
   └─ Inherits parent CSS when HTML structure matches
   └─ Adds additional styling without conflicts
```

### CSS Specificity Rules

**Parent theme rule:**
```css
.vxf-post, .vxf-create-post {
  display: grid;  /* Applies when structure matches */
}
```

**Child theme (scoped):**
```css
.voxel-fse-timeline-kit .vxf-post {
  display: grid;  /* Inherits, doesn't conflict */
  gap: 20px;      /* Adds to parent styling */
}
```

### Why Scoping Works

1. **Isolation:** `.voxel-fse-timeline-kit` wrapper isolates our CSS
2. **Inheritance:** Parent CSS still applies to nested elements
3. **Override prevention:** Unscoped CSS would conflict with parent selectors
4. **Flexibility:** Can add styles without modifying parent theme

---

## Common Pitfalls to Avoid

### ❌ Don't: Override parent layout properties

```css
.vxf-create-post {
  display: flex;  /* WRONG - conflicts with parent's display: grid */
  flex-wrap: wrap;
}
```

### ❌ Don't: Assume CSS gradient = image appearance

```tsx
style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}}
// Result: Wrong colors, doesn't match Voxel
```

### ❌ Don't: Put block styling in editor.css

```css
/* editor.css - WRONG */
.voxf-post {
  display: grid;  /* This should NOT be in editor.css */
  gap: 20px;
}
```

### ✅ Do: Scope styles to block wrapper

```css
.voxel-fse-timeline-kit .vxf-post {
  display: grid;  /* OK - Scoped to wrapper */
  gap: 20px;
}
```

### ✅ Do: Use Voxel's actual image files

```tsx
style={{
  backgroundImage: "url('/wp-content/themes/voxel/assets/images/bg.jpg')"
}}
```

### ✅ Do: Match Voxel HTML structure 1:1

```tsx
// Matches Voxel's social-feed widget HTML exactly
<div className="vxf-post">
  <div className="vxf-head flexify">
    {/* Structure matches Voxel */}
  </div>
</div>
```

---

## Future Block Conversions

### Apply These Lessons To:
1. **Search Form block** - Likely needs scoped CSS for form controls
2. **Create Post block** - Complex nested structure, watch for CSS conflicts
3. **Timeline block** - Will need careful CSS scope management
4. **Other blocks** - Always verify parent CSS inheritance first

### Discovery Process Template
```
1. Find Voxel widget in: themes/voxel/app/widgets/*.php
2. Read HTML structure from widget template
3. Extract all CSS classes and selectors
4. Find Voxel CSS: themes/voxel/assets/dist/social-feed.css (minified)
5. Match structure 1:1 in React component
6. Scope CSS to block wrapper in style.css
7. Keep editor.css minimal (inspector UI only)
8. Test backend + frontend side-by-side
```

---

## References

### Files Created
- [Demofeed.tsx](../../app/blocks/src/timeline-kit/Demofeed.tsx) - Shared preview component
- [style.css](../../app/blocks/src/timeline-kit/style.css) - Frontend styles (scoped)
- [editor.css](../../app/blocks/src/timeline-kit/editor.css) - Backend inspector styles (minimal)
- [block.json](../../app/blocks/src/timeline-kit/block.json) - Block metadata with grid-view icon

### Parent Theme References
- Voxel widget: `themes/voxel/app/widgets/timeline-kit.php`
- Voxel CSS: `themes/voxel/assets/dist/social-feed.css` (defines `.vxf-*` classes)
- Voxel images: `themes/voxel/assets/images/bg.jpg` (background for file uploads)

### Related Blocks
- [Product Price block](../product-price/) - Uses simpler Dashicon pattern
- [Ring Chart block](../ring-chart/) - Uses scoped CSS effectively
- [Print Template block](../print-template/) - Uses template selection pattern

---

## Conclusion

The Timeline Kit block taught us that child theme CSS management requires:
1. **Scoped selectors** to avoid conflicts with parent
2. **Minimal editor.css** (Gutenberg UI only)
3. **Comprehensive style.css** (frontend display)
4. **1:1 HTML matching** for automatic CSS inheritance
5. **Exact asset referencing** (no substitutes or gradients)

These principles will improve all future block conversions and ensure consistency with Voxel's design system.
