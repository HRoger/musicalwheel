# Popup Positioning Architecture for Create-Post Block

**Last Updated:** December 2024
**Status:** Implemented
**Related Files:**
- `app/blocks/src/create-post/components/FieldPopup.tsx`
- `app/blocks/src/create-post/components/product-fields/custom-prices/DateCondition.tsx`
- `app/blocks/src/create-post/components/product-fields/custom-prices/DateRangeCondition.tsx`
- `app/blocks/src/create-post/components/product-fields/custom-prices/DayOfWeekCondition.tsx`

---

## Overview

This document explains how popup positioning works in the Create-Post block and why we use React Portal to match Voxel's original HTML structure.

## The Problem: Nested Popups vs. Portaled Popups

### Initial Implementation (Broken)

Initially, condition components (DateCondition, DateRangeCondition, DayOfWeekCondition) rendered their popups **nested inside** the trigger element:

```html
<!-- BROKEN: Popup nested inside trigger -->
<div class="ts-form-group vx-1-3">
  <div class="ts-filter ts-popup-target">...</div>

  <!-- Popup is a sibling inside the same container -->
  <div class="ts-field-popup-container">
    <div class="ts-field-popup triggers-blur xl-width xl-height">
      <!-- Calendar content -->
    </div>
  </div>
</div>
```

**Problems:**
1. Popup positioned relative to parent container, not document
2. CSS overflow/positioning issues with nested elements
3. Width/height classes applied incorrectly
4. Didn't match Voxel's original HTML structure

### Voxel's Original Structure (Correct)

Voxel uses a **separated/portaled** popup structure where popups are rendered at document level with a `vx-popup` wrapper:

```html
<!-- CORRECT: Voxel's separated popup structure -->
<div class="ts-form-group vx-1-3">
  <div class="ts-filter ts-popup-target">...</div>
  <!-- No popup here - it's portaled to document.body -->
</div>

<!-- Popup rendered at document.body level -->
<div class="elementor vx-popup xl-height xl-width">
  <div class="ts-popup-root elementor-element">
    <div class="ts-form elementor-element" style="position: absolute; top: 123px; left: 456px; width: 300px;">
      <div class="ts-field-popup-container">
        <div class="ts-field-popup triggers-blur">
          <!-- Calendar content -->
        </div>
      </div>
    </div>
  </div>
</div>
```

**Benefits:**
1. Popup positioned absolutely relative to document
2. No CSS conflicts with parent containers
3. Width/height classes on outer `vx-popup` wrapper
4. Matches Voxel's CSS selectors exactly

---

## Solution: FieldPopup Component with React Portal

We created `FieldPopup.tsx` that uses React Portal (`createPortal`) to render popups at `document.body` level.

### Key Architecture

```tsx
// FieldPopup.tsx uses React Portal
import { createPortal } from 'react-dom'; // via wp.element

return createPortal(
  <div className="elementor vx-popup">
    <div className="ts-popup-root elementor-element">
      <div className="ts-form elementor-element" style={positionStyles}>
        <div className="ts-field-popup-container">
          <div className="ts-field-popup triggers-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body  // <-- Portal renders at document.body
);
```

### HTML Structure Hierarchy

```
document.body
└── div.elementor.vx-popup (outer wrapper for Elementor scope)
    └── div.ts-popup-root (root element)
        └── div.ts-form (receives position: absolute + top/left/width)
            └── div.ts-field-popup-container
                └── div.ts-field-popup.triggers-blur (actual popup box)
                    ├── div.ts-popup-head (optional header)
                    ├── div.ts-popup-content-wrapper.min-scroll (content)
                    └── div.ts-popup-controller (footer with buttons)
```

---

## Positioning Algorithm

The positioning logic is adapted from Voxel's Vue mixin (`Voxel.mixins.popup` in `commons.js`):

### Step 1: Get Trigger Position

```typescript
// Viewport-relative position
const triggerRect = targetElement.getBoundingClientRect();

// Document-relative position (like jQuery.offset())
const getOffset = (element: HTMLElement) => {
  let left = 0, top = 0;
  let el = element;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    left += el.offsetLeft - el.scrollLeft;
    top += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { left, top };
};
```

### Step 2: Calculate Horizontal Position (Left)

```typescript
const bodyWidth = document.body.clientWidth;
const triggerCenterX = triggerOffset.left + triggerOuterWidth / 2;
const viewportCenterX = bodyWidth / 2;

let leftPosition: number;
if (triggerCenterX > viewportCenterX + 1) {
  // Right-align popup to right edge of trigger
  leftPosition = triggerOffset.left - popupWidth + triggerOuterWidth;
} else {
  // Left-align popup to left edge of trigger
  leftPosition = triggerOffset.left;
}
```

### Step 3: Calculate Vertical Position (Top)

```typescript
// Default: position below trigger
let topPosition = triggerOffset.top + triggerRect.height;

// Check if doesn't fit below but fits above
const isBottomTruncated = triggerRect.bottom + popupHeight > viewportHeight;
const isRoomAbove = triggerRect.top - popupHeight >= 0;

if (isBottomTruncated && isRoomAbove) {
  // Position above trigger
  topPosition = triggerOffset.top - popupHeight;
}
```

### Step 4: Apply Styles

```typescript
const styles: React.CSSProperties = {
  top: `${topPosition}px`,
  left: `${leftPosition}px`,
  width: `${popupWidth}px`,
  position: 'absolute',
};
```

---

## Event Handling

### Click Outside to Close (Blurable Mixin)

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // Don't close if click is inside the popup
    if (popupBoxRef.current?.contains(target)) {
      return;
    }

    onClose();
  };

  // Use mousedown (same as Voxel) with RAF to ensure popup is rendered
  const rafId = requestAnimationFrame(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, onClose]);
```

### ESC Key to Close

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

### Repositioning on Scroll/Resize

```typescript
useEffect(() => {
  if (!isOpen) return;

  // Initial positioning
  reposition();

  // Listen for scroll (capture phase)
  window.addEventListener('scroll', reposition, true);

  // Listen for resize
  window.addEventListener('resize', reposition, true);

  // Watch for popup content size changes
  const resizeObserver = new ResizeObserver(() => reposition(true));
  resizeObserver.observe(popupBoxRef.current);

  return () => {
    window.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition, true);
    resizeObserver.disconnect();
  };
}, [isOpen, reposition]);
```

---

## Usage in Condition Components

### Before (Broken)

```tsx
// DateCondition.tsx - BROKEN nested popup
return (
  <div className="ts-form-group vx-1-3" ref={containerRef}>
    <div className="ts-filter ts-popup-target" onClick={() => setIsOpen(!isOpen)}>
      ...
    </div>

    {/* Popup nested inside - WRONG */}
    {isOpen && (
      <div className="ts-field-popup-container">
        <div className="ts-field-popup triggers-blur lg-width md-height">
          ...
        </div>
      </div>
    )}
  </div>
);
```

### After (Correct)

```tsx
// DateCondition.tsx - CORRECT using FieldPopup
import { FieldPopup } from '../../FieldPopup';

return (
  <div className="ts-form-group vx-1-3">
    <div
      ref={triggerRef}
      className="ts-filter ts-popup-target"
      onClick={() => setIsOpen(!isOpen)}
    >
      ...
    </div>

    {/* Popup portaled to document.body via FieldPopup */}
    <FieldPopup
      isOpen={isOpen}
      target={triggerRef}
      onSave={handleSave}
      onClear={handleClear}
      onClose={() => setIsOpen(false)}
      showClear={true}
      className="lg-width md-height"
    >
      <div className="ts-form-group">
        <SimpleDatePicker ... />
      </div>
    </FieldPopup>
  </div>
);
```

---

## Why We Don't Need style.css

Since we now use Voxel's exact HTML structure with the `vx-popup` wrapper, Voxel's original CSS applies correctly:

- `vx:commons.css` - Base styles
- `vx:forms.css` - Form field styles
- `vx:create-post.css` - Create post specific styles
- `vx:popup-kit.css` - Popup positioning and sizing
- `vx:product-form.css` - Product form styles

The `style.css` file in `create-post/` was duplicating these styles and causing conflicts. By removing it from `block.json`, we let Voxel's CSS handle all styling.

---

## Reference: Voxel Source Files

- **HTML Structure:** `themes/voxel/templates/components/popup.php:2-56`
- **Positioning Logic:** `themes/voxel/assets/dist/commons.js` (Voxel.mixins.popup)
- **Blurable Mixin:** `themes/voxel/assets/dist/commons.js` (Voxel.mixins.blurable)

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Popup Location | Nested inside trigger | Portaled to document.body |
| Outer Wrapper | None | `div.elementor.vx-popup` |
| Positioning | Relative to parent | Absolute to document |
| CSS Classes | On `ts-field-popup` | On outer `vx-popup` |
| Styling | Custom `style.css` | Voxel's original CSS |
| Click Outside | Container-level listener | Document-level listener |

---

## Issues Encountered and Fixes

### Issue 1: Editor CSS Loading Frontend Styles (2025-12-04)

**Problem:**
The source file `/app/blocks/src/create-post/style.css` was being loaded in the WordPress block editor (backend), causing style conflicts and bloated CSS.

**User Report:**
> "the http://musicalwheel.devlocal/wp-content/themes/voxel-fse/app/blocks/src/create-post/style.css is still being loaded in the backend"

**Investigation:**

1. Checked `block.json` - only has `"editorStyle": "file:./editor.css"`, no `"style"` entry
2. Found `editor.css` had `@import './style.css'` at line 7
3. Block_Loader.php (lines 1977-1984) registers editorStyle from source files with URL pointing to source directory
4. Browser followed the CSS @import and loaded style.css from source

**Root Cause:**

```css
/* editor.css (BEFORE - line 7) */
@import './style.css';
```

When Block_Loader registers `editorStyle: "file:./editor.css"`, it creates a URL like:
```
/wp-content/themes/voxel-fse/app/blocks/src/create-post/editor.css
```

The browser then follows the `@import` directive and loads:
```
/wp-content/themes/voxel-fse/app/blocks/src/create-post/style.css
```

**Solution:**

Removed the `@import './style.css'` line from `editor.css`:

```css
/* editor.css (AFTER) */
/**
 * Create Post Block - Editor Styles
 *
 * NOTE: style.css is NOT imported here because:
 * 1. Voxel's core styles are enqueued via Block_Loader::enqueue_voxel_core_styles()
 * 2. The frontend style.css would conflict with Voxel's styles
 * 3. Editor-only styles can be added here if needed
 */

/* Editor-specific styles only - no frontend style.css import */
```

**Why This Works:**

1. Voxel's core styles (`vx:commons.css`, `vx:forms.css`, `vx:create-post.css`, `vx:popup-kit.css`) are already enqueued via `Block_Loader::enqueue_voxel_core_styles()`
2. The frontend `style.css` was duplicating these styles and causing conflicts
3. Editor-only styles can still be added to `editor.css` if needed without importing frontend styles

**Files Changed:**

- `app/blocks/src/create-post/editor.css` - Removed @import line

**Lesson Learned:**

CSS `@import` in editor stylesheets will cause the imported files to load in the block editor. Always verify that `editorStyle` files don't import frontend-only styles that would conflict with the parent theme's CSS.
