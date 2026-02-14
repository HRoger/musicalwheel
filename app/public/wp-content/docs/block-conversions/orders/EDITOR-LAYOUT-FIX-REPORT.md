# Orders Block - Editor Layout Fix Report

**Date:** Feb 10, 2026
**Issue:** Broken layout in Gutenberg editor (voxel-fse) vs working layout in Elementor editor (stays-el)

## Problem Summary

The Orders block in the Gutenberg editor (voxel-fse) shows a collapsed/broken layout ("No orders found" text is squeezed), while the Elementor editor (stays-el) shows proper spacing and layout.

**Elementor (Original - Working):**
- Big "Orders" title (h1, 46px)
- Subtitle text below
- Centered "No orders found" icon + text
- Proper spacing/gaps between elements

**FSE Gutenberg (Current - Broken):**
- Layout appears collapsed/broken in editor
- "No orders found" text is cramped
- Missing visual hierarchy

## Root Cause Analysis

### 1. Missing CSS Class: `vx-order-ease`

**Location:** `app/blocks/src/orders/edit.tsx` line 29, and `app/blocks/src/orders/shared/OrdersComponent.tsx` line 778

**Current:**
```tsx
baseClass: 'vx-orders-widget voxel-fse-orders-editor'  // edit.tsx:29
<div className="vx-orders-widget">  // OrdersComponent.tsx:778 (frontend)
```

**Should be:**
```tsx
baseClass: 'vx-orders-widget vx-order-ease voxel-fse-orders-editor'  // add vx-order-ease
<div className="vx-orders-widget vx-order-ease">  // add vx-order-ease
```

**Why:** The `vx-order-ease` class applies a fade-in animation via Voxel's orders.css:
```css
.vx-order-ease {
  animation-name: order-fade-in;
  animation-fill-mode: forwards;
  animation-duration: 0.3s;
  animation-timing-function: ease;
  opacity: 0;
}
```

Even though it's primarily visual (fade-in), it's part of the standard structure and may affect layout rendering in the editor.

### 2. Heading Tag Mismatch: `<h2>` vs `<h1>`

**Location:** `app/blocks/src/orders/shared/OrdersComponent.tsx` line 832

**Voxel template (line 23):**
```php
<h1><?php echo $this->get_settings_for_display( 'orders_title' ); ?></h1>
```

**FSE block (line 832):**
```tsx
<h2 style={attributes.titleColor ? { color: attributes.titleColor } : undefined}>
  {attributes.ordersTitle || 'Orders'}
</h2>
```

**Voxel CSS rule:**
```css
.widget-head h1 {
  font-size: 46px;
  margin: 0;
  line-height: 1;
}
```

**Issue:** FSE uses `<h2>` but Voxel's CSS targets `h1` with 46px font-size. The `<h2>` tag doesn't get the same styling, resulting in smaller text and broken visual hierarchy.

### 3. Missing CSS from Voxel

**Location:** `app/blocks/src/orders/edit.tsx` lines 62-74

The editor injects Voxel's orders.css, but this only works in the editor preview, not necessarily in the inspector/settings panel view. The CSS includes:

```css
.vx-orders-widget {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-height: 250px;
}

.widget-head {
  display: flex;
  gap: 5px;
  flex-direction: column;
}

.widget-head h1 {
  font-size: 46px;
  margin: 0;
  line-height: 1;
}

.widget-head p {
  color: var(--ts-shade-2);
}
```

## Fixes Required

### Fix #1: Add `vx-order-ease` class to main wrapper

**File:** `app/blocks/src/orders/edit.tsx` (line 29)
```tsx
// BEFORE:
baseClass: 'vx-orders-widget voxel-fse-orders-editor',

// AFTER:
baseClass: 'vx-orders-widget vx-order-ease voxel-fse-orders-editor',
```

**File:** `app/blocks/src/orders/shared/OrdersComponent.tsx` (line 778)
```tsx
// BEFORE:
<div className="vx-orders-widget" style={customStyles}>

// AFTER:
<div className="vx-orders-widget vx-order-ease" style={customStyles}>
```

### Fix #2: Change `<h2>` to `<h1>` for proper semantic and styling

**File:** `app/blocks/src/orders/shared/OrdersComponent.tsx` (line 832)
```tsx
// BEFORE:
<h2 style={attributes.titleColor ? { color: attributes.titleColor } : undefined}>
  {attributes.ordersTitle || 'Orders'}
</h2>

// AFTER:
<h1 style={attributes.titleColor ? { color: attributes.titleColor } : undefined}>
  {attributes.ordersTitle || 'Orders'}
</h1>
```

**Note:** Also check if there are other `<h2>` tags in the single order view that should remain `<h2>` (they should - only the main widget head should be `<h1>`).

### Fix #3: Verify CSS is loaded in editor

The edit.tsx already injects the Voxel orders.css (lines 62-74), but ensure the Voxel CSS variables are also available in the editor context (--ts-shade-2, --ts-shade-3, etc.).

## Expected Result After Fixes

✅ Elementor-like layout in Gutenberg editor:
- Large "Orders" title (46px, h1)
- Proper subtitle styling
- Correct spacing/gaps
- Fade-in animation applies smoothly
- "No orders found" icon centered with proper spacing

## Implementation Status

- [ ] Fix #1: Add vx-order-ease class (2 locations)
- [ ] Fix #2: Change h2 to h1 in widget-head
- [ ] Fix #3: Verify CSS variables and re-build
- [ ] Test in Gutenberg editor
- [ ] Test frontend rendering
- [ ] Build and deploy

## Files to Modify

1. `app/blocks/src/orders/edit.tsx` - Line 29
2. `app/blocks/src/orders/shared/OrdersComponent.tsx` - Lines 778 and 832

## References

- Voxel Template: `themes/voxel/templates/widgets/orders.php`
- Voxel CSS: `themes/voxel/assets/dist/orders.css`
- FSE Block: `themes/voxel-fse/app/blocks/src/orders/`
