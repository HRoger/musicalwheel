# Stackable Columns Block - Discovery Document

**Date:** December 2025  
**Purpose:** Document Stackable Columns block structure for headless conversion

---

## Block Structure

### Columns Block (`stackable/columns`)

**Block Name:** `stackable/columns`  
**Block File:** `plugins/stackable-ultimate-gutenberg-blocks-premium/src/block/columns/block.json`

**Key Properties:**
- `providesContext`: 
  - `stackable/innerBlockOrientation` → `columnJustify`
  - `stackable/columnWrapDesktop` → `columnWrapDesktop`
- Uses InnerBlocks for column children
- No `render` property (uses JavaScript rendering)

### Column Block (`stackable/column`)

**Block Name:** `stackable/column`  
**Parent:** `stackable/columns` (and others)

**Key Properties:**
- `usesContext`: 
  - `stackable/innerBlockOrientation`
  - `stackable/columnWrapDesktop`
- `providesContext`:
  - `stackable/innerBlockOrientation` → `innerBlockOrientation`

---

## Expected HTML Structure

Based on Stackable patterns and CSS class references:

### Columns Container
```html
<div class="stk-block stk-columns">
  <div class="stk-columns__inner">
    <div class="stk-columns__wrapper" style="...">
      <!-- InnerBlocks: column blocks -->
    </div>
  </div>
</div>
```

### Column Item
```html
<div class="stk-block stk-column" style="...">
  <div class="stk-column__inner">
    <!-- InnerBlocks: column content -->
  </div>
</div>
```

**CSS Classes Found:**
- `.stk-block` - Base block class
- `.stk-columns` - Columns container
- `.stk-columns__inner` - Inner wrapper
- `.stk-columns__wrapper` - Content wrapper
- `.stk-column` - Individual column
- `.stk-column__inner` - Column inner wrapper
- `.stk-block-columns` - Alternative class (from theme inheritance)
- `.stk-block-column` - Alternative class (from theme inheritance)

---

## Inspector Controls (To Implement)

### Columns Block - Layout Tab
- **Column Gap** (responsive: desktop/tablet/mobile)
  - Range control (0-100px default)
  - Unit selector (px, em, %)
- **Column Justification**
  - flex-start, center, flex-end, space-between, space-around
  - Icon button group
- **Column Wrap** (desktop)
  - Toggle: Allow columns to wrap on desktop
- **Equal Height Columns**
  - Toggle: Make all columns same height
- **Reverse Order**
  - Toggle: Reverse column order

### Columns Block - Spacing Tab
- **Margin** (responsive)
  - Four-range control (top, right, bottom, left)
  - Unit selector
  - Linked/unlinked toggle
- **Padding** (responsive)
  - Four-range control (top, right, bottom, left)
  - Unit selector
  - Linked/unlinked toggle

### Columns Block - Colors Tab
- **Background Color**
  - ColorPalette control
- **Background Gradient** (if Stackable has it)
  - Gradient picker
- **Border Color** (if applicable)
  - ColorPalette control

### Columns Block - Advanced Tab
- **Custom CSS Classes**
  - TextControl
- **Custom CSS**
  - TextareaControl
- **Responsive Visibility**
  - Hide on Desktop (ToggleControl)
  - Hide on Tablet (ToggleControl)
  - Hide on Mobile (ToggleControl)

### Column Block - Layout Tab
- **Column Width** (responsive)
  - Range control (0-100%, default: 100)
  - Percentage-based
- **Vertical Alignment**
  - flex-start, center, flex-end, stretch
  - Icon button group
- **Content Alignment**
  - left, center, right
  - Icon button group

### Column Block - Spacing Tab
- **Margin** (responsive)
  - Four-range control
- **Padding** (responsive)
  - Four-range control

### Column Block - Colors Tab
- **Background Color**
  - ColorPalette control
- **Background Gradient** (if applicable)
  - Gradient picker

### Column Block - Advanced Tab
- Same as Columns block

---

## Attributes Structure

### Columns Block Attributes
```typescript
{
  // Layout
  columnGap: number;              // Default: 20
  columnGap_tablet?: number;
  columnGap_mobile?: number;
  columnJustify: string;          // Default: 'flex-start'
  columnWrapDesktop: boolean;     // Default: false
  equalHeight: boolean;           // Default: false
  reverseOrder: boolean;          // Default: false
  
  // Spacing
  blockMargin?: DimensionsConfig;
  blockMargin_tablet?: DimensionsConfig;
  blockMargin_mobile?: DimensionsConfig;
  blockPadding?: DimensionsConfig;
  blockPadding_tablet?: DimensionsConfig;
  blockPadding_mobile?: DimensionsConfig;
  
  // Colors
  backgroundColor?: string;
  backgroundGradient?: string;
  borderColor?: string;
  
  // Advanced
  customClasses?: string;
  customCSS?: string;
  hideDesktop?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;
}
```

### Column Block Attributes
```typescript
{
  // Layout
  columnWidth: number;             // Default: 100 (percentage)
  columnWidth_tablet?: number;
  columnWidth_mobile?: number;
  verticalAlign: string;          // Default: 'flex-start'
  contentAlign: string;           // Default: 'left'
  
  // Spacing
  blockMargin?: DimensionsConfig;
  blockMargin_tablet?: DimensionsConfig;
  blockMargin_mobile?: DimensionsConfig;
  blockPadding?: DimensionsConfig;
  blockPadding_tablet?: DimensionsConfig;
  blockPadding_mobile?: DimensionsConfig;
  
  // Colors
  backgroundColor?: string;
  backgroundGradient?: string;
  
  // Advanced
  customClasses?: string;
  customCSS?: string;
  hideDesktop?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;
}
```

---

## Context API Usage

### Columns Block Provides:
- `stackable/innerBlockOrientation` → `columnJustify` (justification value)
- `stackable/columnWrapDesktop` → `columnWrapDesktop` (boolean)

### Column Block Uses:
- `stackable/innerBlockOrientation` - For alignment
- `stackable/columnWrapDesktop` - For wrap behavior

---

## Implementation Notes

1. **InnerBlocks Handling**: Columns block must support InnerBlocks for column children
2. **Context Passing**: Columns block provides context to column children
3. **Responsive Attributes**: Use `_tablet` and `_mobile` suffixes
4. **CSS Classes**: Must match Stackable exactly for styling inheritance
5. **No PHP Rendering**: All rendering via React (Plan C+)

---

## Next Steps

1. Create block.json files with all attributes
2. Implement custom controls (FourRangeControl, ColumnGapControl, AlignmentControl)
3. Build inspector control tabs
4. Create shared React components
5. Implement editor, save, and frontend files

